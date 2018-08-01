
exports.seed = function(knex, Promise) {
    return knex('users_courses').del()
        .then(function () {
            return knex('users_courses').insert([
                { username: 'will', course: '33:010:272', semester: 'Transfer Courses' },
                { username: 'will', course: '33:010:273', semester: 'External Examinations' },
                { username: 'will', course: '33:010:275', semester: 'Fall 2018' },
                { username: 'ray', course: '33:010:310', semester: 'Transfer Courses' },
                { username: 'ray', course: '33:010:325', semester: 'External Examinations' },
                { username: 'ray', course: '33:010:326', semester: 'Fall 2018' }
            ]);
        });
};
