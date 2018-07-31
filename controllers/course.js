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
            const { name, course_full_number, core_codes, credits, pre_reqs, notes, times} = first_section;
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
                *   day_time: day and am/pm time
                *   location: campus and room
                *   CURRENTLY UNUSED:
                *   meeting_mode
            */
            /*
                *   meeting mode code:
                *   90 -> ONLINE INSTRUCTION(INTERNET)
                *   02 -> LEC
            */

            let sections = [];
            for (let i = 0; i < data.length; i++) {
              let meeting_code = data[i].meetingModeCode; // not returned
              let meeting_mode_desc = data[i].meetingModeDesc;
              let section_number = data[i].section_number;
              let index_number = data[i].section_index;
              let full_times_and_locations = data[i].times;
              let day = formatDay(full_times_and_locations.meetingDay); // not returned
              let pm_code = data[i].pmCode;
              // format time
              let time = 'Error'; // not returned
              if (meeting_code === '90') { // online course
                time = 'Online Course';
                location = 'Online Course';
              } else {
                let time = formatTime(start_time, end_time, pm_code);
              }
              let day_time = day + " " + time;
              // format loaction
              let campus
              let room
              let location = campus + " " + room;
            };

            console.log('DEBUGGING INFO ----------------------------------')
            console.log(name);
            console.log(course_full_number);
            console.log(core_codes_string);
            console.log(credits);
            console.log(pre_reqs);
            console.log(notes);
            console.log(times);
            console.log('-------------------------------------------------')

            res.render('pages/course', data);
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json('Error retrieving course data');
    }
}

const formatDay = (day) => {
  switch (day.toLowerCase) {
    case 'M':
      return 'Mon';
      break;
    case 'T':
      return 'Tue';
      break;
    case 'W':
      return 'Wed';
      break;
    case 'Th':
      return 'Thu';
      break;
    case 'F':
      return 'Fri';
      break;
    case 'S':
      return 'Sat';
      break;
    default:
      return 'Error';
  }
}

/*
    *   since there are no classes at midnight we can assume that
    *   any time where there is a pm code of P and the start timeout
    *   is greater than the end time, that the class goes from AM to PM
    *   or if the end time takes place from 12:00 - 12:59 because classes
    *   are always longer than 59 minutes
*/
const formatTime = (start_time, end_time, pm_code) => {
  if (parseInt(start_time) > parseInt(end_time) || (parseInt(end_time) >= 1200 && parseInt(end_time) <= 1259)) {
    return (stripLeadingZero(start_time) + "AM - " + stripLeadingZero(end_time) + "PM");
  } else {
    return (stripLeadingZero(start_time) + pm_code + "M - " + stripLeadingZero(end_time) + pm_code + "M");
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
    return str.slice(0,2) + ":" + str.slice(2,4);
}
// formatTime('11:00', '12:00', 'P');

const formatLocation = (campus_abbrev, building_code, room_number) => {
  return campus_abbrev + " " + building_code + " " + room_number;
}

module.exports = {
    handleCourseGet: handleCourseGet
}
