const Course = require('../models/Course.js');
const Comment = require('../models/Comment.js');

const handleCourseGet = async (req, res, next) => {
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
        if (selected_course === undefined || selected_course.length === 0) {
            return res.status(404).json('Course not found');
        } else {
            const first_section = selected_course[0];
            // destructuring
            const {
                name,
                course_full_number,
                core_codes,
                credits,
                pre_reqs,
                times,
                url
            } = first_section;

            // formats the core codes
            let core_codes_string = '';
            if (Object.keys(core_codes).length === 0 && core_codes.constructor === Object) {
                core_codes_string = 'None';
            } else {
                core_codes.forEach(function(element) {
                    core_codes_string += element.code + ', ';
                });
                core_codes_string = core_codes_string.substring(0, core_codes_string.length - 2);
            }
            let description = url;
            if (description == null) {
                description = 'Coming Soon';
            }

            data.name = name;
            data.course_full_number = course_full_number;
            data.core_codes_string = core_codes_string;
            data.credits = credits;
            data.pre_reqs = pre_reqs;
            data.description = description;

            // section information
            /* section object will contain the following properties:
               *   section_number
               *   section_index
               *   day_time: day and am/pm time
               *   location: campus and room
               *   instructors
               *   meeting_mode
               *   notes
            */
            /*
               *   meeting mode code:
               *   90 -> ONLINE INSTRUCTION(INTERNET)
               *   02 -> LEC
               *   03 -> RECIT
               *   04 -> SEM
               *   19 -> PROJ-IND
            */
            console.log('SECTION DEBUGGING INFO ----------------------------------');
            console.log('Amount of sections: ' + selected_course.length);
            let sections = [];
            for (let i = 0; i < selected_course.length; i++) {
                let section_number = selected_course[i].section_number;
                let section_index = selected_course[i].section_index;
                let notes = selected_course[i].notes;
                let section_open_status = selected_course[i].section_open_status;
                let exam_code = selected_course[i].exam_code;
                
                let instructors = selected_course[i].instructors;
                if (instructors == null) {
                    instructors = 'None';
                } else {
                    instructors = formatInstructors(instructors);
                }

                let section_times = selected_course[i].times;

                let day_times = [];
                let locations = [];
                let meeting_codes = [];
                let meeting_mode_descs = [];

                console.log('Amount of classes for section' + i + ': ' + section_times.length);
                for (let j = 0; j < section_times.length; j++) {

                    // meeting mode
                    let meeting_code = section_times[j].meetingModeCode;
                    let meeting_mode_desc = section_times[j].meetingModeDesc;

                    // time and location
                    let day_time = formatTimeDay(section_times[j], meeting_code);
                    let location = formatLocation(section_times[j], meeting_code);

                    day_times.push(day_time);
                    locations.push(location);
                    meeting_codes.push(meeting_code);
                    meeting_mode_descs.push(meeting_mode_desc);
                }


                let section = {
                    section_number: section_number,
                    section_index: section_index,
                    notes: notes,
                    day_times: day_times, // is array
                    locations: locations, // is array
                    instructors: instructors,
                    meeting_codes: meeting_codes, // is array
                    meeting_mode_descs: meeting_mode_descs, // is array
                    section_open_status: section_open_status,
                    exam_code: exam_code
                }
                console.log('section' + i);
                console.log(section);
                sections.push(section);
            }
            data.sections = sections;
            
            let course_open_status = 'CLOSED';
            for(let s of sections) {
                if (s.section_open_status === 'OPEN') {
                    course_open_status = 'OPEN';
                    break;
                }
            }
            data.course_open_status = course_open_status;
            
            console.log('-------------------------------------------------')

            console.log('CLASS DEBUGGING INFO ----------------------------------')
            console.log('name: ' + name);
            console.log('course_full_number: ' + course_full_number);
            console.log('core_codes_string: ' + core_codes_string);
            console.log('credits: ' + credits);
            console.log('pre_reqs: ' + pre_reqs);
            console.log('description: ' + data.description);
            console.log('times: ' + times);
            console.log('course_open_status: ' + course_open_status);
            console.log('sections:');
            console.log(sections);
            console.log('-------------------------------------------------')
            
            // handle comments
            const comments = await Comment.query().where('course', course_id);
            
            data.comments = comments;
            
            console.log('COMMENT DEBUGGING INFO ----------------------------------')
            console.log(comments);
            console.log('-------------------------------------------------')
            
            res.render('pages/course', data);
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json('Error retrieving course data');
    }
}

const formatDay = (day) => {
    switch (day) {
        case 'M':
            return 'Mon';
            break;
        case 'T':
            return 'Tue';
            break;
        case 'W':
            return 'Wed';
            break;
        case 'TH':
            return 'Thu';
            break;
        case 'F':
            return 'Fri';
            break;
        case 'S':
            return 'Sat';
            break;
        default:
            console.log('day passed: ' + day);
            return 'N/A';
    }
}

/*
 *   since there are no classes at midnight we can assume that
 *   any time where there is a pm code of P and the start timeout
 *   is greater than the end time, that the class goes from AM to PM
 *   or if the end time takes place from 12:00 - 12:59 because classes
 *   are always longer than 59 minutes
 */
const formatTime = (times, meeting_code) => {
    // check for meeting type
    if (meeting_code === '90') {
        return 'Online';
    } else if (meeting_code === '19') {
        return 'Independent Project';
    } else {
        // fall back incase time passed is null
        let time;
        if (times.startTime == null || times.endTime == null) {
            return 'N/A';
        } else {
            let start_time = times.startTime;
            let end_time = times.endTime;
            let pm_code = times.pmCode;
            if (parseInt(start_time) > parseInt(end_time) || (parseInt(end_time) >= 1200 && parseInt(end_time) <= 1259)) {
                return (stripLeadingZero(start_time) + "AM - " + stripLeadingZero(end_time) + "PM");
            } else {
                return (stripLeadingZero(start_time) + pm_code + "M - " + stripLeadingZero(end_time) + pm_code + "M");
            }
        }
    }
}

const stripLeadingZero = (str) => {
    if (str === '') {
        return '';
    } else {
        str = addColon(str);
        if (str.indexOf(0) == '0') {
            return str.slice(1);
        } else {
            return str;
        }
    }
}

const addColon = (str) => {
    return str.slice(0, 2) + ":" + str.slice(2, 4);
}
// formatTimeDay('11:00', '12:00', 'P');

const formatTimeDay = (times, meeting_code) => {
    if (meeting_code === '90' || meeting_code === '19') {
        return formatTime(times, meeting_code);
    }
    return formatDay(times.meetingDay) + " " +  formatTime(times, meeting_code);
}

const formatLocation = (times, meeting_code) => {
    if (meeting_code === '90') {
        return 'Online';
    } else if (meeting_code === '19') {
        return 'Independent Project';
    } else {
        // make sure there is a fall back in case any location properties are null
        let campus_abbrev = times.campusAbbrev;
        let building_code = times.buildingCode;
        let room_number = times.roomNumber;
        if (campus_abbrev == null) {
            campus_abbrev = 'N/A';
        }
        if (building_code == null) {
            building_code = 'N/A';
        }
        if (room_number == null) {
            room_number = 'N/A';
        }
        return campus_abbrev + " " + building_code + " " + room_number;
    }
}

const formatInstructors = (instructors) => {
    return instructors.replace(/ and /, '<br>');
}
module.exports = {
    handleCourseGet: handleCourseGet
}
