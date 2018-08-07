const Requirement = require('../models/Requirement');
const dump = require('dumper.js/src/dump');

const displayHomepage = async (req, res) => {
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
        data = requirementSearch(req.query, data);
    }
    else if (req.query.search === 'direct') {
        data = directSearch(req.query, data);
    }

    res.render('pages/index', data);
}

const requirementSearch = (params, data) => {
    dump(params);
    const requirement = await Requirement
      .query()
      .eager('pets');
    return data;
}

const directSearch = (params, data) => {
    console.log('direct search');
    return data;
}

module.exports = {
    displayHomepage: displayHomepage
}
