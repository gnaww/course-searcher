const Requirement = require('../models/Requirement');
const dump = require('dumper.js/src/dump');

const displayHomepage = knex => (req, res) => {
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
        let query = requirementSearch(req.query, req, res, knex);
        if (query === 'error') {
            return;
        } else {
            data.results = query.results;
            data.form = query.form;
        }
    }
    else if (req.query.search === 'direct') {
        let query = directSearch(req.query, req, res, knex);
        if (query === 'error') {
            return;
        } else {
            data.results = query.results;
            data.form = query.form;
        }
    }
    console.log(req.url)
    res.render('pages/index', data);
}

const requirementSearch = (params, req, res, knex) => {
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
    dump(requirements);
    dump(formRequirements);
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
        knex.raw(`SELECT * FROM
                 (
                     SELECT DISTINCT ON (course_full_number)
                     course_full_number, name, core_codes, pre_reqs, section_open_status, cr.count as count
                     FROM courses AS c INNER JOIN
                     (
                         SELECT course, COUNT(course) AS count FROM courses_requirements
                         WHERE requirement = 'AHp'
                         GROUP BY course
                     ) cr
                     ON c.course_full_number = cr.course
                 ) t
                 ORDER BY name`)
            .then(result => {
                // console.log(result.rows);
                result.rows.forEach(course => {
                    // console.log(course.count);
                    course.core_codes.forEach(code => {
                        // process.stdout.write(code.code + ' ');
                    });
                    // process.stdout.write(course.count + ' ' + course.name + ' ' + course.course_full_number + ' ' + course.section_open_status);
                    // console.log();
                });
            });
        return { results: [], form: { search: 'requirement', requirements: formRequirements }}; //replace [] with db query result
    }
}

const directSearch = (params, req, res, knex) => {
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
            formCategory[category] = true;
            formCategory.default = false;
            let formDirect = {
                search: 'direct',
                category: formCategory,
                query: params.query
            };
            return {  results: [], form: formDirect }; //replace the [] with the database query result
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

const isRequirement = key => {
    return key === 'NS' || key === 'SCL' || key === 'HST' || key === 'WC' || key === 'WCr' || key === 'WCd' || key === 'CC' || key === 'QQ' || key === 'QR' || key === 'AHo' || key === 'AHp' || key === 'AHq' || key === 'AHr' || key === 'ITR';
}

module.exports = {
    displayHomepage: displayHomepage
}
