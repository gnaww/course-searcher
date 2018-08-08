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
        knex.raw(`SELECT DISTINCT ON (course_full_number)
                  course_full_number, name,
                  FROM courses INNER JOIN courses_requirements
                  ON courses.course_full_number = courses_requirements.course
                  WHERE courses_requirements.requirement = '${username}'`)
            .then(results => {
                console.log(results);
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
