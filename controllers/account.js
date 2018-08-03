const displayAccount = (knex, data) => (req, res) => {
    const username = req.session.user
    if (!data) {
        if (req.session.notification) {
            data = {
                notification: req.session.notification,
                user: username
            };
            req.session.notification = null;
        } else {
            data = {
                notification: null,
                user: username
            };
        }
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

const handleAccount = knex => (req,res) => {
    console.log(req.body);
    displayAccount(knex, {
        notification: {
            type: 'success',
            message: 'yay'
        },
        user: req.session.user
    })(req, res);
}

module.exports = {
    displayAccount: displayAccount,
    handleAccount: handleAccount
}
