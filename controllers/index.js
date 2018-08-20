const Requirement = require('../models/Requirement');
const dump = require('dumper.js/src/dump');
const validator = require('validator');
const knexfile = require('../knexfile.js');
const knex = require('knex')(knexfile);

const displayHomepage = knex => async (req, res) => {
    let data = {
        notification: null,
        user: null,
        form: null,
        results: null
    };
    if (req.session.notification) {
        data.notification = req.session.notification;
        req.session.notification = null;
    }
    if (req.session.user) {
        data.user = req.session.user;
    }

    if (req.query.search === 'requirement') {
        let query = await requirementSearch(req.query, req, res, knex);
        if (query === 'error') {
            return;
        } else {
            data.results = query.results;
            data.form = query.form;
        }
    }
    else if (req.query.search === 'direct') {
        let query = await directSearch(req.query, req, res, knex);
        if (query === 'error') {
            return;
        } else {
            data.results = query.results;
            data.form = query.form;
        }
    }
    res.render('pages/index', data);
}

const requirementSearch = async (params, req, res, knex) => {
    // dump(params);

    // contains all requirements to query db for
    let requirements = [];

    // for prepopulating form after search
    let requirementCheckboxes = {
        NS: false,
        SCL: false,
        HST: false,
        WC: false,
        WCr: false,
        WCd: false,
        CC: false,
        QQ: false,
        QR: false,
        AHo: false,
        AHp: false,
        AHq: false,
        AHr: false,
        ITR: false
    };

    // validate requirement params
    Object.keys(params).forEach(key => {
        if (isRequirement(key)) {
            requirementCheckboxes[key] = true;
            requirements.push(key);
        }
    });

    if (!Array.isArray(requirements) || !requirements.length) {
        req.session.notification = {
            type: 'error',
            message: 'Error searching by requirement! Must select at least one requirement checkbox.'
        }
        res.redirect('/');
        return 'error';
    } else { // valid search query
        // create WHERE condition based on params
        let whereClause = '';
        requirements.forEach(requirement => {
            whereClause += `requirement = '${requirement}' OR `
        });
        whereClause = whereClause.slice(0, whereClause.length - 4);

        // create ORDER BY condition based on params
        let orderBy = 'requirement DESC';
        if (params.sort && (params.sort === 'requirement' || params.sort === 'number' || params.sort === 'name' || params.sort === 'credits')) {
            if (params.order && (params.order === 'asc' || params.order === 'desc')) {
                orderBy = `${params.sort} ${params.order.toUpperCase()}`
            }
        }

        // query db for courses
        try {
            let result = await knex.raw(
                `SELECT * FROM
                (
                    SELECT DISTINCT ON (course_full_number)
                    course_full_number as number, name, core_codes, pre_reqs, credits, cr.count as requirement
                    FROM courses AS c INNER JOIN
                    (
                        SELECT course, COUNT(course) AS count FROM courses_requirements
                        WHERE ${whereClause}
                        GROUP BY course
                    ) cr
                    ON c.course_full_number = cr.course
                ) t
                ORDER BY ${orderBy}`
            );

            // populate results array
            let results = [];
            result.rows.forEach(course => {
                let c = {};

                if(!Array.isArray(course.core_codes) || !course.core_codes.length) {
                    c.requirements = 'None';
                } else {
                    let codes = '';
                    course.core_codes.forEach(code => {
                        codes += `${code.code}, `;
                    });
                    c.requirements = codes.slice(0, codes.length - 2);
                }
                c.number = course.number;
                c.name = course.name;
                c.prerequisites = course.pre_reqs;
                c.credits = course.credits;
                results.push(c);
            });

            let formRequirements = {
                search: 'requirement',
                requirements: requirementCheckboxes
            }

            // check if results should be personalized
            if (req.session.user && params.personalize === 'true') {
                results = await personalizeFilter(results, req.session.user, req, res);
                if (results === 'error') {
                    return 'error';
                }
                formRequirements.personalize = true;
            } else {
                formRequirements.personalize = false;
            }

            return { results: results, form: formRequirements };
        }
        catch (e) {
            console.log('error searching db by req:', e);
            req.session.notification = {
                type: 'error',
                message: 'Error searching by requirement! Something went wrong on our end :('
            }
            res.redirect('/');
            return 'error';
        }
    }
}

const directSearch = async (params, req, res, knex) => {
    // dump(params);

    // for prepopulating form after search
    let formCategory = {
        default: true,
        keyword: false,
        index: false,
        course: false,
        professor: false,
        minCredit: false,
        maxCredit: false
    };

    if (params.category && params.query) {
        let category = params.category;

        // validate search categories
        if (category === 'keyword' || category === 'index' || category === 'course' || category === 'professor' || category === 'minCredit' || category === 'maxCredit') { // valid search query

            // create WHERE condition based on params
            let whereClause;
            if (category === 'keyword') {
                let keywords = params.query.split(' ');
                whereClause = 'WHERE ';
                keywords.filter(keyword => {
                    if (keyword) {
                        return true;
                    } else {
                        return false;
                    }
                }).forEach(keyword => {
                    whereClause += `UPPER(name) LIKE UPPER('%${keyword}%') OR UPPER(full_name) LIKE UPPER('%${keyword}%') OR `
                })
                whereClause = whereClause.slice(0, whereClause.length - 4);
            } else if (category === 'index') {
                if (validator.isInt(params.query)) {
                    whereClause = `WHERE section_index = ${params.query}`;
                } else {
                    console.log('searched for course index without an integer');
                    req.session.notification = {
                        type: 'error',
                        message: 'Error searching by course index number! A number was not queried.'
                    }
                    res.redirect('/');
                    return 'error';
                }
            } else if (category === 'course') {
                whereClause = `WHERE UPPER(course_full_number) LIKE UPPER('%${params.query}%')`;
            } else if (category === 'professor') {
                let professors = params.query.split(' ');
                whereClause = 'WHERE ';
                professors.filter(professor => {
                    if (professor) {
                        return true;
                    } else {
                        return false;
                    }
                }).forEach(professor => {
                    whereClause += `UPPER(instructors) LIKE UPPER('%${professor}%') OR `
                })
                whereClause = whereClause.slice(0, whereClause.length - 4);
            } else if (category === 'minCredit') {
                // course credits are only integers or x.5
                if (!isNaN(params.query) && Number(params.query) % 0.5 === 0) {
                    whereClause = `WHERE credits >= ${params.query}`;
                } else {
                    console.log('searched by credits without an integer or 0.5 number:', params.query);
                    req.session.notification = {
                        type: 'error',
                        message: 'Error searching by course credits! Credits must be an integer or divisible by 0.5.'
                    }
                    res.redirect('/');
                    return 'error';
                }
            } else if (category === 'maxCredit') {
                if (!isNaN(params.query) && Number(params.query) % 0.5 === 0) {
                    whereClause = `WHERE credits <= ${params.query}`;
                } else {
                    console.log('searched by credits without an integer or 0.5 number:', params.query);
                    req.session.notification = {
                        type: 'error',
                        message: 'Error searching by course credits! Credits must be an integer or divisible by 0.5.'
                    }
                    res.redirect('/');
                    return 'error';
                }
            }

            formCategory[category] = true;
            formCategory.default = false;

            // create ORDER BY condition based on params
            let orderBy = 'requirement DESC';
            if (params.sort && (params.sort === 'requirement' || params.sort === 'number' || params.sort === 'name' || params.sort === 'credits')) {
                if (params.order && (params.order === 'asc' || params.order === 'desc')) {
                    orderBy = `${params.sort} ${params.order.toUpperCase()}`
                }
            }

            // query db for courses
            try {
                let result = await knex.raw(
                    `SELECT * FROM
                    (
                        SELECT DISTINCT ON (course_full_number)
                        course_full_number as number, name, core_codes, pre_reqs, credits, JSONB_ARRAY_LENGTH(core_codes) as requirement
                        FROM courses ${whereClause}
                    ) c
                    ORDER BY ${orderBy}`
                );

                // populate results array
                let results = [];
                result.rows.forEach(course => {
                    let c = {};

                    if(!Array.isArray(course.core_codes) || !course.core_codes.length) {
                        c.requirements = 'None';
                    } else {
                        let codes = '';
                        course.core_codes.forEach(code => {
                            codes += `${code.code}, `;
                        });
                        c.requirements = codes.slice(0, codes.length - 2);
                    }
                    c.number = course.number;
                    c.name = course.name;
                    c.prerequisites = course.pre_reqs;
                    c.credits = course.credits;
                    results.push(c);
                });

                let formDirect = {
                    search: 'direct',
                    category: formCategory,
                    query: params.query
                };

                // check if results should be personalized
                if (req.session.user && params.personalize === 'true') {
                    results = await personalizeFilter(results, req.session.user, req, res);
                    if (results === 'error') {
                        return 'error';
                    }
                    formDirect.personalize = true;
                } else {
                    formDirect.personalize = false;
                }

                return { results: results, form: formDirect };
            }
            catch (e) {
                console.log('error searching db directly:', e);
                req.session.notification = {
                    type: 'error',
                    message: 'Error searching courses directly! Something went wrong on our end :('
                }
                res.redirect('/');
                return 'error';
            }
        } else {
            req.session.notification = {
                type: 'error',
                message: 'Error searching courses directly! An invalid search category was chosen.'
            }
            res.redirect('/');
            return 'error';
        }
    } else {
        req.session.notification = {
            type: 'error',
            message: 'Error searching courses directly! Both a category and query string must be entered.'
        }
        res.redirect('/');
        return 'error';
    }
}

const personalizeFilter = async (results, user, req, res) => {
    try {
        let userCourses = await knex('users_courses').where('username', user);
        let courses = [];
        if (userCourses != null && userCourses.length > 0) {
            userCourses[0].courses.forEach(semester  => {
                semester[1].forEach(course => {
                    courses.push(course.id);
                });
            });
            let resultsFiltered = results.filter(course => {
                // remove if user already took class
                if (courses.includes(course.number)) {
                    return false;
                } else {
                    let prereqs = course.prerequisites.toUpperCase();

                    // check if prerequisites are fulfilled
                    if (prereqs === 'NONE') {
                        return true;
                    }
                    else if (prereqs === 'TWO COURSE WITHIN THE SUBJECT AREA:') {
                        let courseSubject = course.number.slice(3,6);
                        let numCoursesInSubject = 0;
                        courses.forEach(userCourse => {
                            if (userCourse.slice(3,6) === courseSubject) {
                                numCoursesInSubject++;
                            }
                            if (numCoursesInSubject >= 2) {
                                return true;
                            }
                        });
                        return false;
                    }
                    else if (prereqs.includes('ANY COURSE EQUAL OR GREATER THAN:')) {
                        let greaterThanPrereq = prereqs.slice('ANY COURSE EQUAL OR GREATER THAN:'.length + 2, prereqs.length - 2)
                        let unitSubject = greaterThanPrereq.slice(0, 6);
                        courses.forEach(userCourse => {
                            // make sure class and prereq are same unit and subject
                            if (userCourse.slice(0,6) === unitSubject) {
                                return parseInt(userCourse.slice(7)) >= parseInt(greaterThanPrereq.slice(7))
                            }
                        });
                    } else {
                        // turn prerequisites into boolean expression to be evaluated
                        let prereqsFormatted = prereqs.replace(/<em>|<\/em>/gi, '').replace(/OR/gi, '||').replace(/AND/gi, '&&').replace(/\d{2}:\d{3}:\d{3}/gi, match => {
                            return `courses.includes('${match}')`;
                        });
                        return eval(prereqsFormatted);
                    }
                }
            });

            // console.log(`pre filter: ${results.length} | after filter: ${resultsFiltered.length}`);
            return resultsFiltered;
        } else {
            console.log('user has no saved courses yet');
            req.session.notification = {
                type: 'error',
                message: 'Error personalizing results! You haven\'t saved any completed courses yet. Go to your <a href="/account" class="alert-link">account</a> to save your completed courses!'
            }
            res.redirect('/');
            return 'error';
        }
    } catch (e) {
        console.log('error getting user courses for personal filter:', e);
        req.session.notification = {
            type: 'error',
            message: 'Error personalizing results! Something went wrong on our end :('
        }
        res.redirect('/');
        return 'error';
    }
}

// check if is one of 14 valid requirements
const isRequirement = key => {
    return key === 'NS' || key === 'SCL' || key === 'HST' || key === 'WC' || key === 'WCr' || key === 'WCd' || key === 'CC' || key === 'QQ' || key === 'QR' || key === 'AHo' || key === 'AHp' || key === 'AHq' || key === 'AHr' || key === 'ITR';
}

module.exports = {
    displayHomepage: displayHomepage
}
