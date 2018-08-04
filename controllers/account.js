const validator = require('validator');

const displayAccount = (knex, form) => (req, res) => {
    let username = req.session.user;
    let data = {
        notification: null,
        user: username
    };
    if (req.session.notification) {
        data.notification = req.session.notification;
        req.session.notification = null;
    }
    if (form) {
        data.form = form;
    } else {
        data.form = null;
    }
    knex('users_courses').where({ username: username }).select('courses')
        .then(result => {
            let semesters = {};
            if (result[0]) {
                result[0].courses.forEach(semester => {
                    let semesterName = semester[0];
                    let courses = [];
                    semester[1].forEach(course => {
                        courses.push(`(${course.id}) ${course.name}`)
                    });
                    semesters[semesterName] = courses;
                });
            }
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

const handleAccount = (knex, pdfjsLib) => (req, res) => {
    if (req.files) {
        let transcript = req.files.transcript;
        var data = new Uint8Array(transcript.data);

        pdfjsLib.getDocument(data).then(function (pdf) {
            // Create an array that will contain our promises
            var pagesPromises = [];

            for (var i = 0; i < pdf.pdfInfo.numPages; i++) {
                // Required to prevent that i is always the total of pages
                (function (pageNumber) {
                    // Store the promise of getPageText that returns the text of a page
                    pagesPromises.push(getPageText(pageNumber, pdf));
                })(i + 1);
            }
            // Execute all the promises
            Promise.all(pagesPromises).then(function (pagesText) {
                /* Rutger Transcript PDF order:
                   1)External Examinations 2)Transfer Courses 3)Fall/Spring/Summer semesters */

                let transcript = pagesText.join(' ');
                let special, sem, userCourses;
                userCourses = new Map(); // Map of courses user has taken and labeled by semester taken, to be inserted into DB

                // get external examinations/transfer courses if exist
                for (var i = 0; i < 2; i++) {
                    special = getSpecialSemester(transcript);
                    if (special === -1) {
                        break;
                    } else {
                        transcript = transcript.slice(special.endIndex + sectionEnd.length);
                        // appendSemester(special.name, special.courses);
                        userCourses.set(special.name, special.courses);
                    }
                }

                // get remaining regular semesters if exist
                while (true) {
                    sem = getSemester(transcript);
                    if (sem === -1) {
                        break;
                    } else {
                        transcript = transcript.slice(sem.endIndex + sectionEnd.length);
                        // appendSemester(sem.name, sem.courses);
                        userCourses.set(sem.name, sem.courses);
                    }
                }

                userCoursesJSONStringified = JSON.stringify([...userCourses])
                let userCoursesJSON = JSON.parse(userCoursesJSONStringified);
                // for (let i = 0; i < userCoursesJSON.length; i++) {
                //     console.log(userCoursesJSON[i][0], userCoursesJSON[i][1]);
                // }
                req.session.notification = {
                    type: 'success',
                    message: 'Successfully parsed transcript!'
                };
                return displayAccount(knex, userCoursesJSON)(req,res);
            });
        }, function (reason) {
            console.error(reason);
            req.session.notification = {
                type: 'error',
                message: 'Error while parsing transcript. Something went wrong on our end :('
            };
            res.redirect('/account');
        })
        .catch(err => {
            console.log('error while parsing transcript', err);
            req.session.notification = {
                type: 'error',
                message: 'Error while parsing transcript. Something went wrong on our end :('
            };
            res.redirect('/account');
        });
    } else {
        let courses = req.body.courses;
        if (courses) {
            let endsWithNewLine = validator.matches(courses.slice(courses.length - 6),/\r|\n/);
            if (!endsWithNewLine) {
                courses += '\n';
            }

            let courseRegex = /-\([0-9]{2}:[0-9]{3}:[0-9]{3}\).*?[\r\n|\n|\r]/gi;
            let semesterNameRegex = /Spring\s\d{4}|Fall\s\d{4}|Summer\s\d{4}|External Examinations|Transfer Courses/gi;

            let coursesValidate = courses.replace(courseRegex, '').replace(semesterNameRegex, '');
            let coursesIsValid = validator.isEmpty(coursesValidate.trim());

            if (coursesIsValid) {
                let semesterNames = courses.match(semesterNameRegex);
                let semesters = courses.split(semesterNameRegex);
                semesters.shift();
                let insertSemesters = [];
                if (semesterNames.length === semesters.length) {
                    for (let i = 0; i  < semesterNames.length; i++) {
                        let insertSemester = [];
                        let insertSemesterCourses = [];
                        let semesterCourses = semesters[i].split(/\r\n|\n|\r/g);
                        semesterCourses.pop();
                        semesterCourses.shift();
                        // console.log(semesterNames[i], semesterCourses);

                        insertSemester.push(semesterNames[i]);
                        semesterCourses.forEach(course => {
                            let id = course.slice(2, 12);
                            let name = course.slice(14);
                            insertSemesterCourses.push({ id: id, name: name });
                        })
                        insertSemester.push(insertSemesterCourses);
                        insertSemesters.push(insertSemester);
                    }
                    knex.raw(`INSERT INTO users_courses
                              (username, courses) VALUES (:uname, :c)
                              ON CONFLICT (username)
                              DO UPDATE SET courses = :c;`, { uname: req.session.user, c: JSON.stringify(insertSemesters) })
                    .then(response => {
                        req.session.notification = {
                            type: 'success',
                            message: 'Successfully saved completed courses!'
                        };
                        res.redirect('/account');
                    })
                    .catch(err => {
                        console.log('error while upserting users_courses', err);
                        req.session.notification = {
                            type: 'error',
                            message: 'Error saving completed courses. Something went wong on our end :('
                        };
                        res.redirect('/account');
                    });
                } else {
                    console.log('number of semester names and grouped courses didn\'t match');
                    req.session.notification = {
                        type: 'error',
                        message: 'Error saving completed courses. Something went wrong on our end :('
                    };
                    res.redirect('/account');
                }
            } else {
                console.log('submitted text didn\'t pass format validation');
                req.session.notification = {
                    type: 'error',
                    message: 'Error saving completed courses. The template was not followed.'
                };
                res.redirect('/account');
            }
        } else {
            console.log('empty transcript text submission')
            req.session.notification = {
                type: 'error',
                message: 'Error while saving completed courses. No text was submitted.'
            };
            res.redirect('/account');
        }
    }
}

const getPageText = (pageNum, PDFDocumentInstance) => {
    // Return a Promise that is solved once the text of the page is retrieven
    return new Promise(function (resolve, reject) {
        PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
            // The main trick to obtain the text of the PDF page, use the getTextContent method
            pdfPage.getTextContent().then(function (textContent) {
                var textItems = textContent.items;
                var finalString = "";

                // Concatenate the string of the item to the final string
                for (var i = 0; i < textItems.length; i++) {
                    var item = textItems[i];

                    finalString += item.str + " ";
                }

                // Solve promise with the text retrieved from the page
                resolve(finalString);
            });
        });
    });
}

// Every section of the transcript ends with this string
const sectionEnd = '                                                                      .';

// Use regex to get the course name and associated course ID number
const getCourseInfo = semester => {
    // splits the coucrse information into separate array elements
    const dividersRE = /(?<=(CEEB\sADVANCED\sPLACEMENT\sIN:)|CLASS:\s[0-9]{2}|((SPRING|FALL|SUMMER)\s[0-9]{4})|[0-9]\.[0-9]).*?([0-9]{2}\s\s[0-9]{3}\s\s[0-9]{3}|TR\s\sT01\s\sEC)/gi;
    // gets rid of any remaining unneccessary information
    const junkRE = /(CEEB\sADVANCED\sPLACEMENT\sIN:)|CLASS:\s[0-9]{2}|((SPRING|FALL|SUMMER)\s[0-9]{4})|[0-9]\.[0-9]/i;
    // gets rid of any grade information
    // possible values of grades column: A+, A, A-, B+, B, B-, C+, C, C-, D+, D, D-, F, NP, PA
    const gradesRE = /\sA\+\s|\sA\s|\sA-\s|\sB\+\s|\sB\s|\sB-\s|\sC\+\s|\sC\s|\sC-\s|\sD\+\s|\sD\s|\sD-\s|\sF\s|\sNP\s|\sPA\s/i;
    // gets rid of any prefix information
    // possible values of prefix column: R, E, P, NC, P/NC, M
    const prefixRE = /\sR\s|\sE\s|\sP\s|\sNC\s|\sP\/NC\s|\sM\s/i;

    let coursesInfo = semester.match(dividersRE);
    let coursesInfoCleaned = coursesInfo.map(course => {
        course = course.replace(junkRE, '');
        course = course.replace(gradesRE, '');
        course = course.replace(prefixRE, '');
        course = course.replace(/DEANS\sLIST/, '');
        return course.trim();
    });

    // remove extra credit courses that don't count as any prerequisite
    let coursesInfoFiltered = coursesInfoCleaned.filter(course => {
        if (!course.match(/TR\s\sT01\s\sEC/)) {
            return true;
        } else {
            return false;
        }
    });

    let courses = [];
    coursesInfoFiltered.forEach(courseInfo => {
        let courseNum = courseInfo.match(/[0-9]{2}\s\s[0-9]{3}\s\s[0-9]{3}/)[0];
        let courseNumFormatted = courseNum.replace(/\s+/g,':');
        let courseName = courseInfo.replace(/[0-9]{2}\s\s[0-9]{3}\s\s[0-9]{3}/, '').trim();
        courses.push({ id: courseNumFormatted, name: courseName });
    });
    return courses;
};

/* Get External Examination/Transfer section if it exists. Returns special semester name, array of course numbers, and end index of special semester or -1 if no semester found.*/
const getSpecialSemester = transcript => {
    let specialName = transcript.match(/(EXTERNAL\sEXAMINATIONS|TRANSFER\sCOURSES)/mi);
    if (specialName) {
        specialName = specialName[0].toLowerCase();
        // capitalize first letter of each word
        specialName = specialName.replace(/\w\S*/g, function(str){
            return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
        });
        let specialEndIndex = transcript.indexOf(sectionEnd);
        let courses = getCourseInfo(transcript.slice(0,specialEndIndex));
        return { name: specialName, courses: courses, endIndex: specialEndIndex};
    } else {
        return -1;
    }
};

/* Get a single semester (Fall/Spring/Summer) if it exists. Returns semester name, array of course numbers, and end index of semester or -1 if no semester found. */
const getSemester = transcript => {
    let headerEndIndex = transcript.indexOf('MAJOR:');
    if (headerEndIndex === -1) { // no remaining semesters found
        return -1
    } else {
        // get semester name
        let semesterHeader = transcript.slice(0,headerEndIndex);
        let semesterName = semesterHeader.match(/(SPRING|FALL|SUMMER)\s+[0-9]{4}/mi);
        semesterName = semesterName[0].replace(/\s+/gm, ' ');
        // get semester course numbers
        let semesterEndIndex = transcript.indexOf(sectionEnd);
        let courses = getCourseInfo(transcript.slice(headerEndIndex + 'MAJOR:'.length, semesterEndIndex));

        return { name: semesterName, courses: courses, endIndex: semesterEndIndex};
    }
};

module.exports = {
    displayAccount: displayAccount,
    handleAccount: handleAccount
}
