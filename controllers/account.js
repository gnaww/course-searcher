const displayAccount = (knex) => async (req, res) => {
    const username = req.session.user
    let data = {
        notification: null,
        user: username
    };
    if (req.session.notification) {
        data.notification = req.session.notification;
        req.session.notification = null;
    }
    knex.raw(`SELECT DISTINCT ON (course_full_number)
                course_full_number, name, users_courses.semester
                FROM courses INNER JOIN users_courses
                ON courses.course_full_number = users_courses.course
                WHERE users_courses.username = '${username}'`)
        .then(results => {
            let semesters = {};
            results.rows.forEach(course => {
                let sem = course.semester;
                if (semesters[sem]) {
                    semesters[sem].push(`(${course.course_full_number}) ${course.name}`);
                } else {
                    semesters[sem] = [];
                    semesters[sem].push(`(${course.course_full_number}) ${course.name}`);
                }
            });
            data.semesters = semesters;
            res.render('pages/account', data);
        })
        .catch(err => {
            console.log('error occurred while querying users_courses: ', err.stack);
            data.notification = {
                type: 'error',
                message: 'Error retrieving account information. Something went wrong on our end :('
            };
            res.render('pages/account', data);
        });
}

module.exports = {
    displayAccount: displayAccount
}
