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
                *   03 -> RECIT
                *   04 -> SEM
                *   19 -> PROJ-IND
            */
            console.log('SECTION DEBUTTING INFO ----------------------------------');
            console.log('Amount of sections: ' + selected_course.length);
            let sections = [];
            for (let i = 0; i < selected_course.length; i++) {
              let section_number = selected_course[i].section_number;
              let index_number = selected_course[i].section_index;

              let section_times = selected_course[i].times;

              let day_times = [];
              let locations = [];
              let meeting_codes = [];
              let meeting_mode_descs = [];

              console.log('Amount of classes for section' + i +': ' + section_times.length);
              for (let j = 0; j < section_times.length; j++) {
                let pm_code = section_times[i].pmCode; // not returned
                let day_time = 'Error';

                // format location
                let location = 'Error'

                // meeting mode
                let meeting_code = section_times[i].meetingModeCode;
                let meeting_mode_desc = section_times[i].meetingModeDesc;

                // take care of time and location
                if (meeting_code === '90') { // online course
                  let time = 'Online Course';
                  location = 'Online Course';
                } else if(meeting_code === '19') {
                  let time = 'Project/Independent';
                  location = 'Project/Independent';
                } else {
                  // time
                  let start_time = section_times[i].startTime;
                  let end_time = section_times[i].endTime;
                  let day = formatDay(section_times[i].meetingDay);
                  let time = formatTime(start_time, end_time, pm_code);
                  day_time = day + " " + time;
                  // loaction
                  let campus = section_times[i].campusAbbrev;
                  let building = section_times[i].buildingCode;
                  let room = section_times[i].roomNumber;
                  location = campus + ' ' + building + ' ' + room;

                  day_times.push(day_time);
                  locations.push(location);
                  meeting_codes.push(meeting_code);
                  meeting_mode_descs.push(meeting_mode_desc);
                }
              }


              let section = {
                section_number: section_number,
                index_number: index_number,
                day_times: day_times, // is array
                locations: locations, // is array
                meeting_codes: meeting_codes, // is array
                meeting_mode_descs: meeting_mode_descs // is array
              }
              console.log('section' + i);
              console.log(section);
              sections.push(section);
            }
            console.log('-------------------------------------------------')

            console.log('CLASS DEBUGGING INFO ----------------------------------')
            console.log('name: ' + name);
            console.log('course_full_number: ' + course_full_number);
            console.log('core_codes_string: ' + core_codes_string);
            console.log('credits: ' + credits);
            console.log('pre_reqs: ' + pre_reqs);
            console.log('notes: ' + notes);
            console.log('times: ' + times);
            console.log('sections: ' + sections);
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
      return 'Day Error';
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
