const Requirement = require('../models/Requirement');
const dump = require('dumper.js/src/dump');

const displayHomepage = knex => (req, res) => {
    let data = {
        notification: null,
        user: null
    };
    if (req.session.notification) {
        data.notification = req.session.notification;
        req.session.notification = null;
    }
    if (req.session.user) {
        data.user = req.session.user;
    }

    if (req.query.search === 'requirement') {
        let results = requirementSearch(req.query, req, res, knex);
        if (results === 'error') {
            return;
        } else {
            data.results = results;
        }
    }
    else if (req.query.search === 'direct') {
        data.results = directSearch(req.query, req, res, knex);
    }

    res.render('pages/index', data);
}

const requirementSearch = (params, req, res, knex) => {
    dump(params);
    let numRequirements = 0;
    let requirements = [];
    Object.keys(params).forEach(key => {
        if (isRequirement(key)) {
            requirements.push(key);
            numRequirements++;
        }
    });
    if (numRequirements > 4) {
        req.session.notification = {
            type: 'error',
            message: 'Error searching by requirement! Choosing more than 4 requirements makes the search too restrictive.'
        }
        res.redirect('/');
        return 'error';
    } else {
        dump(requirements);
        // const requirement = await Requirement
        //     .query()
        //     .eager('courses')
        //     .then(results => {
        //         // console.log(results[0].courses[0].core_codes);
        //     });
        knex.raw(`SELECT * FROM (
                      SELECT DISTINCT ON (course_full_number)
                      course_full_number, name, core_codes, pre_reqs, section_open_status
                      FROM courses AS c INNER JOIN courses_requirements AS cr
                      ON c.course_full_number = cr.course
                      GROUP BY cr.course
                      ORDER BY course_full_number
                  ) t
                  ORDER BY COUNT(cr.course)`)
                   //WHERE cr.requirement = 'AHo' OR cr.requirement = 'AHp'
            .then(result => {
                result.rows.forEach(course => {
                    course.core_codes.forEach(code => {
                        process.stdout.write(code.code + ' ');
                    });
                    console.log();
                });
            });
    }
}

const directSearch = (params, req, res, knex) => {
    console.log('direct search');
}

const isRequirement = key => {
    return key === 'NS' || key === 'SCL' || key === 'HST' || key === 'WC' || key === 'WCr' || key === 'WCd' || key === 'CC' || key === 'QQ' || key === 'QR' || key === 'AHo' || key === 'AHp' || key === 'AHq' || key === 'AHr' || key === 'ITR';
}

module.exports = {
    displayHomepage: displayHomepage
}
