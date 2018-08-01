// Code from: https://ourcodeworld.com/articles/read/405/how-to-convert-pdf-to-text-extract-text-from-pdf-with-javascript

// Path to PDF file
var PDF_URL;

// Open file upload input when user clicks button
$(".upload-button").on('click', function() {
    $("#transcript-upload").trigger('click');
});

// When save button clicked save user data to DB
$(".save-button").on('click', function() {
    // Insert courses from array userCourses into DB

    // refresh page to see changes
    window.location.reload();
});

// When save button clicked save user data to DB
$(".submit-button").on('click', function() {
    // Insert courses from array userCourses into DB

    // refresh page to see changes
    window.location.reload();
});

// Every section of the transcript ends with this string
const sectionEnd = '                                                                      .';

// Use regex to get the unique course IDs
const getCourseNums = semester => {
    const courseNumRE = /[0-9]{2}\s\s[0-9]{3}\s\s[0-9]{3}/gmi;
    let courseNums = semester.match(courseNumRE);
    return courseNums.map(courseNum => courseNum.replace(/\s+/gm,':'));
};

/* Get External Examination/Transfer section if it exists. Returns special semester name, array of course numbers, and end index of special semester or -1 if no semester found.*/
const getSpecialSemester = (transcript) => {
    let specialName = transcript.match(/(EXTERNAL\sEXAMINATIONS|TRANSFER\sCOURSES)/mi);
    if (specialName) {
        specialName = specialName[0].toLowerCase();
        // capitalize first letter of each word
        specialName = specialName.replace(/\w\S*/g, function(str){
            return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
        });
        let specialEndIndex = transcript.indexOf(sectionEnd);
        let courseNums = getCourseNums(transcript.slice(0,specialEndIndex));
        return { name: specialName, courses: courseNums, endIndex: specialEndIndex};
    } else {
        return -1;
    }
};

/* Get a single semester (Fall/Spring/Summer) if it exists. Returns semester name, array of course numbers, and end index of semester or -1 if no semester found. */
const getSemester = transcript => {
    let headerEndIndex = transcript.indexOf('MAJOR');
    if (headerEndIndex === -1) { // no remaining semesters found
        return -1
    } else {
        // get semester name
        let semesterHeader = transcript.slice(0,headerEndIndex);
        let semesterName = semesterHeader.match(/(SPRING|FALL|SUMMER)\s+[0-9]{4}/mi);
        semesterName = semesterName[0].replace(/\s+/gm, ' ');
        // get semester course numbers
        let semesterEndIndex = transcript.indexOf(sectionEnd);
        let courseNums = getCourseNums(transcript.slice(0,semesterEndIndex));

        return { name: semesterName, courses: courseNums, endIndex: semesterEndIndex};
    }
};

/* Add a single semester to newly uploaded section */
const appendSemester = (semesterName, semesterCourses) => {
    let coursesList = "";
    for (let i = 0; i < semesterCourses.length; i++) {
        coursesList += "<li>" + semesterCourses[i] + "</li>";
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

            let special, sem, userData;
            userCourses = {}; // object of courses user has taken, to be inserted into DB

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
                        userCourses[special.name] = special.courses;
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
                        userCourses[sem.name] = sem.courses;
                    }
                }

                /********************************** NOTES ************************/
                // parse class names in addition to course numbers????
                // how to submit custom data through a form POST request
                /********************END NOTES ************************************/

                
                // Show save button
                $('.save-button').show();
                // remove loading icon
                $('#loading').remove();
                $(".upload-button").show();
            }, 1000);
        });
    }, function (reason) {
        alert("An error occurred while parsing your transcript! Make sure you uploaded the unofficial version of your transcript in PDF format. Error details logged in console.")
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
