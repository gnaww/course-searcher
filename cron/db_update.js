const cron = require("node-cron");
const fs = require("fs");
const fetch = require('node-fetch');
const knexfile = require('../knexfile.js');
const Knex = require('knex');
const knexConfig = require('../knexfile');
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
const { Model } = require('objection');
const now = require("performance-now")


const Course = require('../models/Course.js');

//initalize knex (won't need this later on)
const knex = Knex(knexConfig);

Model.knex(knex);

const semester = '92018';
const debuggingMode = false;

// returns an array of subject codes
const getSubjectCodes = async () => {
    try {
        const response = await fetch(`https://sis.rutgers.edu/soc/subjects.json?semester=${semester}&campus=NB&level=U`);
        const subjects = await response.json();
        let subjectCodes = [];
        for (subject of subjects) {
            subjectCodes.push(subject.code);
        }
        return subjectCodes;
    } catch (error) {
        console.log('subject code error');
        console.log(error);
        throw('there was an error retrieving subject codes');
    }
}

// gets the course data from rutgers api
const getCourseData = async (subjectCode) => {
    try {
        const response = await fetch(`https://sis.rutgers.edu/soc/courses.json?subject=${subjectCode}&semester=${semester}&campus=NB&level=U`);
        const courseData = await response.json();
        // console.log(courseData);
        return courseData;
    } catch (error) {
        console.log('course data error');
        console.log(error);
        throw('there was an error retrieving course data');
    }
}

// updates the entire db (should only be done once a semester)
const updateAllCoursesData = async () => {
    let start = now();
    let updatedSections = 0;
    try {
        subjectCodes = await getSubjectCodes();
        let courseSections = [];
        // iterates through all of the subjects
        for(subjectCode of subjectCodes) {
            if (debuggingMode) {
                console.log('------------------------------------------------------------------');
                console.log('UPDATING SECTION: ' + subjectCode);
            }

            // includes all sections and courses in a subject
            let courses = await getCourseData(subjectCode);
            // iterates through all the courses
            for (course of courses) {
                let {
                        offeringUnitCode: courseUnitCode,
                        subject: courseSubject,
                        courseNumber,
                        title,
                        expandedTitle: courseLongTitle,
                        sections: courseSections,
                        campusCode: courseCampus,
                        synopsisUrl: courseUrl,
                        preReqNotes: coursePreReqs,
                    } = course;
                let courseFullNum = courseUnitCode + ':' + courseSubject + ':' + courseNumber;
                let courseShortTitle = title.toString().trim().replace("'", "");
                if (courseLongTitle) {
                    courseLongTitle = courseLongTitle.toString().trim().replace("'", "");
                }
                let courseCredits = 0;
                if (course.credits != null) {
                    courseCredits = course.credits;
                }
                let courseCoreCodes = [];
                if (course.coreCodes != null) {
                    courseCoreCodes = course.coreCodes;
                }
                if (coursePreReqs == null) {
                    coursePreReqs = 'None';
                }

                // iterates through all sections
                for (section of courseSections) {
                    updatedSections++;
                    let {
                        number: sectionNum,
                        index: sectionIndex,
                        sectionNotes,
                        examCode: sectionExamCode
                    } = section;
                    let sectionOpenStatus = 'CLOSED';
                    if (section.openStatus) {
                        sectionOpenStatus = 'OPEN';
                    }

                    let sectionInstructors = null;
                    if (debuggingMode) {
                        console.log(section.instructors);
                    }
                    for (instructor of section.instructors) {
                        if (sectionInstructors != null) {
                            sectionInstructors += " and " + instructor.name;
                        } else {
                            sectionInstructors = instructor.name;
                        }
                    }
                    if (sectionInstructors != null) {
                        sectionInstructors = sectionInstructors.replace("'", "");
                    }

                    let sectionTimes = JSON.stringify(section.meetingTimes);
                    if (sectionNotes != null) {
                        sectionNotes = sectionNotes.replace("'", "");
                    } else {
                        sectionNotes = 'None';
                    }
                    let lastUpdatedTime = new Date().toLocaleString("en-US");

                    const insertedSection = await knex.raw(
                        `INSERT INTO courses
                        (course_unit, course_subject, course_number, course_full_number, name, full_name, section_number, section_index, section_open_status, instructors, times, notes, exam_code, campus, credits, url, pre_reqs, core_codes, last_updated) VALUES
                        (:cu, :cs, :cn, :cfn, :na, :full_na, :sn, :si, :sos, :i, :t, :no, :ec, :campus, :credits, :u, :pr, :coreCodes, :lu)
                        ON CONFLICT (section_index)
                        DO UPDATE SET section_open_status = :sos;`,
                        {
                            cu: parseInt(courseUnitCode),
                            cs: parseInt(courseSubject),
                            cn: parseInt(courseNumber),
                            cfn: courseFullNum,
                            na: courseShortTitle,
                            full_na: courseLongTitle,
                            sn: sectionNum,
                            si: parseInt(sectionIndex),
                            sos: sectionOpenStatus,
                            i: sectionInstructors,
                            t: sectionTimes,
                            no: sectionNotes,
                            ec: sectionExamCode,
                            campus: courseCampus,
                            credits: courseCredits,
                            u: courseUrl,
                            pr: coursePreReqs + '',
                            coreCodes: JSON.stringify(courseCoreCodes),
                            lu: lastUpdatedTime
                         });
                    if (debuggingMode) {
                        console.log(`${courseFullNum} |\t${courseShortTitle}\t | INSTRUCTORS ${sectionInstructors} |\t SECTION INDEX ${sectionIndex}\t| CREDITS ${courseCredits}`);
                    }
                    if (!(courseCoreCodes === undefined || courseCoreCodes.length === 0)) {
                        for (req of courseCoreCodes) {
                            const insertedRequirement = await knex('courses_requirements').insert({course: courseFullNum, requirement: req.coreCode});
                        }
                    }

                }
            }
            const removeRows = knex.raw(`DELETE FROM courses_requirements
                                         WHERE ctid not in
                                         (SELECT MIN(ctid)
                                         FROM courses_requirements
                                         GROUP BY course, requirement)`);
        }
        let end = now();
        let performance = (end-start).toFixed(3);
        console.log('------------------------------------------------------------------');
        console.log(`DB UPDATE FINISHED IN: ${performance/1000} seconds`);
        console.log('UPDATED ' + updatedSections + " SECTIONS");
        console.log('DEBUGGING MODE: ' + debuggingMode);
    } catch (error) {
        console.log('there was an error updating the db');
        console.log(error);
    }

}

//updateAllCoursesData();

module.exports = { updateAllCoursesData: updateAllCoursesData }
