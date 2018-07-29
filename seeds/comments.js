
exports.seed = function(knex, Promise) {
    return knex('comments').del()
        .then(function () {
            return knex('comments').insert([
                { comment: 'graviterque senserit irure offendit illum fugiat fore cernantur transferrem nostrud senserit domesticarum nescius ab voluptate fore instituendarum graviterque offendit expetendis do tempor aut appellat ab familiaritatem quis aliquip despicationes in', rating: 1, course: '33:010:272', user: 'will' },
                { comment: 'graviterque senserit irure offendit illum fugiat fore cernantur transferrem nostrud senserit domesticarum nescius ab voluptate fore instituendarum graviterque offendit expetendis do tempor aut appellat ab familiaritatem quis aliquip despicationes in', rating: 2, course: '33:010:272', user: 'will' },
                { comment: 'graviterque senserit irure offendit illum fugiat fore cernantur transferrem nostrud senserit domesticarum nescius ab voluptate fore instituendarum graviterque offendit expetendis do tempor aut appellat ab familiaritatem quis aliquip despicationes in', rating: 3, course: '33:010:273', user: 'will' },
                { comment: 'graviterque senserit irure offendit illum fugiat fore cernantur transferrem nostrud senserit domesticarum nescius ab voluptate fore instituendarum graviterque offendit expetendis do tempor aut appellat ab familiaritatem quis aliquip despicationes in', rating: 4, course: '33:010:273', user: 'ray' },
                { comment: 'graviterque senserit irure offendit illum fugiat fore cernantur transferrem nostrud senserit domesticarum nescius ab voluptate fore instituendarum graviterque offendit expetendis do tempor aut appellat ab familiaritatem quis aliquip despicationes in', rating: 5, course: '33:010:275', user: 'ray' }
            ]);
        });
};
