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
    dump(params);
    let numRequirements = 0;
    let requirements = [];
    let formRequirements = {
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

    Object.keys(params).forEach(key => {
        if (isRequirement(key)) {
            formRequirements[key] = true;
            requirements.push(key);
            numRequirements++;
        }
    });
    if (numRequirements > 4) {
        req.session.notification = {
            type: 'error',
            message: 'Error searching by requirement! Choosing more than 4 requirements makes the search too general.'
        }
        res.redirect('/');
        return 'error';
    } else if (!Array.isArray(requirements) || !requirements.length) {
        req.session.notification = {
            type: 'error',
            message: 'Error searching by requirement! Must select at least one requirement checkbox.'
        }
        res.redirect('/');
        return 'error';
    } else { // valid search query
        let whereClause = '';
        requirements.forEach(requirement => {
            whereClause += `requirement = '${requirement}' OR `
        });
        whereClause = whereClause.slice(0, whereClause.length - 4);

        let orderBy = 'requirement DESC';
        if (params.sort && (params.sort === 'requirement' || params.sort === 'number' || params.sort === 'name' || params.sort === 'status')) {
            if (params.order && (params.order === 'asc' || params.order === 'desc')) {
                orderBy = `${params.sort} ${params.order.toUpperCase()}`
            }
        }
        try {
            let result = await knex.raw(
                `SELECT * FROM
                (
                    SELECT DISTINCT ON (course_full_number)
                    course_full_number as number, name, core_codes, pre_reqs, section_open_status as status, cr.count as requirement
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
            let results = [];
            result.rows.forEach(course => {
                let c = {};

                if(Object.keys(course.core_codes).length === 0 && course.core_codes.constructor === Object) {
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
                c.status = course.status;
                results.push(c);
            });
            // console.log(results);
            console.log(results.length + ' results')
            if (req.session.user && params.personalize === 'true') {
                results = await personalizeFilter(results, req.session.user, req, res);
                if (results === 'error') {
                    return
                }
            }
            return { results: results, form: { search: 'requirement', requirements: formRequirements }};
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
    dump(params);
    let formCategory = {
        default: true,
        keyword: false,
        index: false,
        course: false,
        professor: false
    };
    if (params.category && params.query) {
        let category = params.category;
        if (category === 'keyword' || category === 'index' || category === 'course' || category === 'professor') { // valid search query
            let whereClause;
            if (category === 'keyword') {
                whereClause = `WHERE UPPER(name) LIKE UPPER('%${params.query}%')`;
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
                whereClause = `WHERE UPPER(instructors) LIKE UPPER('%${params.query}%')`;
            }
            try {
                let result = await knex.raw(
                    `SELECT DISTINCT ON (course_full_number)
                    course_full_number as number, name, core_codes, pre_reqs, section_open_status as status
                    FROM courses ${whereClause}`
                );
                let results = [];
                result.rows.forEach(course => {
                    let c = {};

                    if(Object.keys(course.core_codes).length === 0 && course.core_codes.constructor === Object) {
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
                    c.status = course.status;
                    results.push(c);
                });
                // console.log(results);
                console.log(results.length + ' results')
                if (req.session.user && params.personalize === 'true') {
                    results = await personalizeFilter(results, req.session.user, req, res);
                    if (results === 'error') {
                        return
                    }
                }
                formCategory[category] = true;
                formCategory.default = false;
                let formDirect = {
                    search: 'direct',
                    category: formCategory,
                    query: params.query
                };
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
    console.log('personalization filtering');
    console.log(user);
    try {
        let userCourses = await knex('users_courses').where('username', user);
        console.log(userCourses);
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

const isRequirement = key => {
    return key === 'NS' || key === 'SCL' || key === 'HST' || key === 'WC' || key === 'WCr' || key === 'WCd' || key === 'CC' || key === 'QQ' || key === 'QR' || key === 'AHo' || key === 'AHp' || key === 'AHq' || key === 'AHr' || key === 'ITR';
}

module.exports = {
    displayHomepage: displayHomepage
}
