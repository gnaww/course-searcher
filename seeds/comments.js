
exports.seed = function(knex, Promise) {
    return knex('comments').del()
        .then(function () {
            return knex('comments').insert([
                { comment: 'hello hello this is a comment test test', rating: 2, course: '33:010:272', user: 'will' },
                { comment: 'blah blah blah', rating: 3, course: '33:010:273', user: 'will' },
                { comment: 'foo bar hello world as;dflk mskf akl;f sdjfkl;j fkl;j asklfjwif opawio jfkljsd;kl fjsdk', rating: 3, course: '33:010:275', user: 'will' },
                { comment: 'this is another comment hello testing 123', rating: 1, course: '33:010:272', user: 'ray' },
                { comment: 'fl jdklf jjeaiof oaij fkla lask  oawoi asup oiaj kl;asj l;kakmg sjal;kf jk', rating: 4, course: '33:010:273', user: 'ray' },
                { comment: 'wor uwpio oi jioasfl ks;l fk;afj kl;ajfkl; jfkl; asjfkl; ;j asf asip oiu opiaujf l;kajwsrt ;as ', rating: 5, course: '33:010:275', user: 'ray' }
            ]);
        });
};
