const displayNews = (req, res) => {
    res.render('pages/news', data);
}

const displaySuggestions = (req, res) => {
    res.render('pages/suggestions', data);
}

module.exports = {
    displayNews: displayNews,
    displaySuggestions: displaySuggestions
};
