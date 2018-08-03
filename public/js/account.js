// Code from: https://ourcodeworld.com/articles/read/405/how-to-convert-pdf-to-text-extract-text-from-pdf-with-javascript

// Path to PDF file
var PDF_URL;
let userCoursesObj;
// Open file upload input when user clicks button
$(".upload-button").on('click', function() {
    $("#transcript-upload").trigger('click');
});

// When auto submission save button clicked save user data to DB
$(".save-button").on('click', function() {
    fetch('http://localhost:3000/account',
        {
            method: 'POST',
            credentials: 'include',
            headers: {"Content-Type": "application/json"},
            body: userCoursesObj
        })
        .then(res => {
            $( `<div class='alert alert-success alert-dismissible fade show' role='alert'>
                    Successfully saved completed classes! Refresh the page to view the changes.
                    <button type='button' class='close' data-dismiss='alert' aria-label='Close'>
                        <span aria-hidden='true'>&times;</span>
                    </button>
                </div>` ).insertBefore( ".container-fluid" );
            $('#auto-modal').modal('toggle');
            $('.save-button').hide();
        })
        .catch(err => {
            $( `<div class='alert alert-danger alert-dismissible fade show' role='alert'>
                    Something went wrong :(. Refresh the page and try again.
                    <button type='button' class='close' data-dismiss='alert' aria-label='Close'>
                        <span aria-hidden='true'>&times;</span>
                    </button>
                </div>` ).insertBefore( ".container-fluid" );
            $('#auto-modal').modal('toggle');
            $('.save-button').hide();
        })
});

// When manual submission save button clicked save user data to DB
$(".submit-button").on('click', function() {

});

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

/* Add a single semester to newly uploaded section */
const appendSemester = (semesterName, semesterCourses) => {
    let coursesList = "";
    for (let i = 0; i < semesterCourses.length; i++) {
        coursesList += `<li>(${semesterCourses[i].id}) ${semesterCourses[i].name}</li>`;
    }
    $(".modal-body").append(`<div class="new-semester"><h2>${semesterName}</h2><ul>${coursesList}</ul></div>`);
}

// When user chooses a PDF file
$("#transcript-upload").on('change', function() {
    $('.upload').nextAll().remove();
    $(".upload-button").hide();
    $("#upload-auto-form").append("<div class='lds-dual-ring' id='loading'></div>");
    // Get user uploaded file
    PDF_URL = URL.createObjectURL($("#transcript-upload").get(0).files[0]);

    // Parse PDF for course numbers and semester names
    pdfjsLib.getDocument(PDF_URL).then(function (pdf) {
        var pdfDocument = pdf;
        // Create an array that will contain our promises
        var pagesPromises = [];

        for (var i = 0; i < pdf.pdfInfo.numPages; i++) {
            // Required to prevent that i is always the total of pages
            (function (pageNumber) {
                // Store the promise of getPageText that returns the text of a page
                pagesPromises.push(getPageText(pageNumber, pdfDocument));
            })(i + 1);
        }

        // Execute all the promises
        Promise.all(pagesPromises).then(function (pagesText) {
            /* Rutger Transcript PDF order:
               1)External Examinations 2)Transfer Courses 3)Fall/Spring/Summer semesters */

            let transcript = pagesText.join(' ');

            let special, sem, userCourses;
            userCourses = new Map(); // Map of courses user has taken and labeled by semester taken, to be inserted into DB

            // forcing it to wait to parse/render to see that beautiful loading icon lol
            setTimeout(function(){
                /* Algorithm: Find external/transfer if exists first. Then keep on checking for regular          semesters and remove from string, when can't find any more semesters you are finished */

                // get external examinations/transfer courses if exist
                for (var i = 0; i < 2; i++) {
                    special = getSpecialSemester(transcript);
                    if (special === -1) {
                        break;
                    } else {
                        transcript = transcript.slice(special.endIndex + sectionEnd.length);
                        appendSemester(special.name, special.courses);
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
                        appendSemester(sem.name, sem.courses);
                        userCourses.set(sem.name, sem.courses);
                    }
                }

                userCoursesObj = JSON.stringify([...userCourses])
                let test = JSON.parse(userCoursesObj);
                // for (let i = 0; i < test.length; i++) {
                //     console.log(test[i][0]);
                //     console.log(test[i][1]);
                // }

                // Show save button
                $('.save-button').show();
                // remove loading icon
                $('#loading').remove();
                $(".upload-button").show();
            }, 0);
        });
    }, function (reason) {
        alert("An error occurred while parsing your transcript! Make sure you uploaded the unofficial version of your transcript in PDF format. Error details logged in developer console.")
        // PDF loading error
        console.error(reason);
    });
});

/**
 * Retrieves the text of a specific page within a PDF Document obtained through pdf.js
 *
 * @param {Integer} pageNum Specifies the number of the page
 * @param {PDFDocument} PDFDocumentInstance The PDF document obtained
 **/
function getPageText(pageNum, PDFDocumentInstance) {
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

                // Solve promise with the text retrieven from the page
                resolve(finalString);
            });
        });
    });
}

// Turn on Bootstrap tooltips
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});
