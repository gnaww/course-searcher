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
    if (deletePost && req.session.user === 'admin') {
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
        if (title && content) {
            knex('news').insert({ title: title, content: content })
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
        } else {
            console.log('missing title and/or content in news post');
            req.session.notification = {
                type: 'error',
                message: 'Error posting news post. Missing title or content'
            }
            res.redirect('/news');
        }
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
    const { suggestion, category, suggestionId } = req.body;
    let categories = ['Completed', 'In Progress', 'Discarded', 'Uncategorized'];

    if (category && suggestionId && req.session.user === 'admin') {
        if (categories.includes(category)) {
            knex('suggestions')
                .where('id', suggestionId)
                .update({
                  category: category
                })
                .then(result => {
                    req.session.notification = {
                        type: 'success',
                        message: 'Successfully updated suggestion category.'
                    }
                    res.redirect('/suggestions');
                })
                .catch(err => {
                    console.log(err);
                    req.session.notification = {
                        type: 'error',
                        message: 'Error updating suggestion category.'
                    }
                    res.redirect('/suggestions');
                });
        } else {
            console.log('invalid category to update suggestion to');
            req.session.notification = {
                type: 'error',
                message: 'Error updating suggestion category. Invalid category'
            }
            res.redirect('/suggestions');
        }
    } else if (suggestion) {
        knex('suggestions').insert( {suggestion: suggestion, category: 'Uncategorized' })
            .then(result => {
                req.session.notification = {
                    type: 'success',
                    message: 'Successfully added new suggestion!'
                }
                res.redirect('/suggestions');
            })
            .catch(err => {
                console.log(err);
                req.session.notification = {
                    type: 'error',
                    message: 'Error adding new suggestion. Something went wrong on our end :('
                }
                res.redirect('/suggestions');
            });
    }
}

module.exports = {
    displayNews: displayNews,
    handleNews: handleNews,
    displaySuggestions: displaySuggestions,
    handleSuggestions: handleSuggestions
};
