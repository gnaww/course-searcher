const displayNews = knex => async (req, res) => {
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
    data.newsPosts = await knex('news').orderBy('date', 'desc');
    res.render('pages/news', data);
}

const handleNews = knex => async (req, res) => {
    const { title, content, deletePost } = req.body;
    if (deletePost) {
        knex('news')
            .where('id', deletePost)
            .del()
            .then(result => {
                req.session.notification = {
                    type: 'success',
                    message: 'Successfully deleted news post.'
                }
                res.redirect('/news');
            })
            .catch(err => {
                console.log(err);
                req.session.notification = {
                    type: 'error',
                    message: 'Error deleting news post.'
                }
                res.redirect('/news');
            });
    } else {
        knex('news').insert({title: title, content: content})
        .then(result => {
            req.session.notification = {
                type: 'success',
                message: 'Successfully posted news post.'
            }
            res.redirect('/news');
        })
        .catch(err => {
            console.log(err);
            req.session.notification = {
                type: 'error',
                message: 'Error posting news post.'
            }
            res.redirect('/news');
        });
    }
}

const displaySuggestions = knex => async (req, res) => {
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
    data.completed = await knex('suggestions').where('category', 'Completed');
    data.inProgress = await knex('suggestions').where('category', 'In Progress');
    data.discarded = await knex('suggestions').where('category', 'Discarded');
    data.uncategorized = await knex('suggestions').where('category', 'Uncategorized');
    res.render('pages/suggestions', data);
}

const handleSuggestions = knex => (req, res) => {
    const { suggestion, category } = req.body;
}

module.exports = {
    displayNews: displayNews,
    handleNews: handleNews,
    displaySuggestions: displaySuggestions,
    handleSuggestions: handleSuggestions
};
