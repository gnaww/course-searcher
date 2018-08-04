
exports.seed = function(knex, Promise) {
    return knex('users_courses').del()
        .then(function () {
            return knex('users_courses').insert([
                { username: 'will', courses: JSON.stringify([['External Examinations', [{ id: '33:010:273', name: 'CLASS ASSIST FIN ACT' }]], ['Transfer Courses', [{ id: '33:010:272', name: 'INTRO FINANCIAL ACCT' }]], ['Fall 2018', [{ id: '33:010:275', name: 'INTRO TO MNGRL ACCTG' }]]]) },
                { username: 'ray', courses: JSON.stringify([['External Examinations', [{ id: '33:010:325', name: 'INTERMED ACCTNG I' }]], ['Transfer Courses', [{ id: '33:010:310', name: 'ACCTNG FOR ENGINEERS' }]], ['Fall 2018', [{ id: '33:010:326', name: 'INTERMED ACCTNG II' }]]]) }
            ]);
        });
};
