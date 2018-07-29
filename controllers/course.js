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
        // course information
        const selected_course = await Course.query().where('course_full_number', course_id);
        console.log(selected_course);
        if (selected_course === undefined || selected_course.length === 0) {
            return res.status(404).json('Course not found');
        } else {
            const first_section = selected_course[0];
            const { name, course_full_number, core_codes, credits, pre_reqs, notes, time} = first_section;
            let core_codes_string = '';
            
            // formats the core codes
            if (Object.keys(core_codes).length === 0 && core_codes.constructor === Object) {
                core_codes_string = 'None';
            } else {
                core_codes.forEach(function(element) {
                    core_codes_string += element.code + ', ';
                });
                core_codes_string = core_codes_string.substring(0, core_codes_string.length - 2);
            }
            
            
            data.name = name;
            data.course_full_number = course_full_number;
            data.core_codes_string = core_codes_string;
            data.credits = credits;
            data.pre_reqs = pre_reqs;
            data.notes = notes;
            
            // section information
            /* section object will contain the following properties:
                *   section_number
                *   index_number
                *   time
                *   location
            */
            
            data.sections = [];
            
            console.log('DEBUGGING INFO ----------------------------------')
            console.log(name);
            console.log(course_full_number);
            console.log(core_codes_string);
            console.log(credits);
            console.log(pre_reqs);
            console.log(notes);
            console.log(time);
            console.log('-------------------------------------------------')

            res.render('pages/course', data);
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json('Error retrieving course data');
    }
}

module.exports = {
    handleCourseGet: handleCourseGet
}
