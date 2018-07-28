const Course = require('../models/Course.js');

const handleCourseGet = async (req, res, next) =>  {
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
    const course_id = req.query.id;
    try {
        const selected_course = await Course.query().where('course_full_number', course_id);
        console.log(selected_course);
        if (selected_course === undefined || selected_course.length == 0) {
            return res.status(404).json('Course not found');
        } else {
            const first_section = selected_course[0];
            const { name, course_full_number, core_codes, credits, notes } = first_section;
            let core_codes_string = '';
            
            // formats the core codes
            if (core_codes) {
                core_codes.forEach(function(element) {
                    core_codes_string += element.code + ', ';
                });
                core_codes_string = core_codes_string.substring(0, core_codes_string.length - 2);
            } else {
                core_codes_string = 'None';
            }
            
            data.name = name;
            data.course_full_number = course_full_number;
            data.core_codes_string = core_codes_string;
            data.credits = credits;
            data.notes = notes;
            
            console.log(name);
            console.log(course_full_number);
            console.log(core_codes_string);
            console.log(credits);
            console.log(notes);
            
            res.render('views/pages/course', data);
            return res.json(selected_course);
        } 
    } catch (error) {
        console.log(error);
        return res.status(400).json('Error retrieving course data');
    }
}

module.exports = { handleCourseGet }
