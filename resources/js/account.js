// Code from: https://ourcodeworld.com/articles/read/405/how-to-convert-pdf-to-text-extract-text-from-pdf-with-javascript

// Path to PDF file
var PDF_URL = 'mybadgrades.pdf';

// Specify the path to the worker
PDFJS.workerSrc = '/resources/js/pdf.worker.js';

PDFJS.getDocument(PDF_URL).then(function (pdf) {

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
        
        // Remove loading
        $("#loading").remove();
        
        /* Rutger Transcript PDF order: 
           1)External Examinations 2)Transfer Courses 3)Fall/Spring/Summer semesters */
        
        let transcript = pagesText.join(' ');
        //console.log(transcript);
        
        // Every section of the transcript ends with this string
        const sectionEnd = '                                                                      .';
        
        // Use regex to get the unique course IDs
        const getCourseNums = semester => {
            const courseNumRE = /[0-9]{2}\s\s[0-9]{3}\s\s[0-9]{3}/gmi;
            return semester.match(courseNumRE);
        };
        
        /* Get External Examination/Transfer section end index if it exists. Returns index for end of special section, -1 if not found. */
        const getSpecialEndIndex = (transcript, special) => {
            let externalIndex = transcript.indexOf(special); // -1 if not found
            if (externalIndex === -1) {
                return -1;
            } else {
                let endIndex = transcript.indexOf(sectionEnd);
                return endIndex;
            }
        };
        
        /* Get a single semester (Fall/Spring/Summer) if it exists. Returns semester name and array of course numbers, -1 if no semester found. */
        const getEndIndex = transcript => {
            let headerEndIndex = transcript.indexOf('MAJOR');
            if (headerEndIndex === -1) { // no remaining semesters found
                return -1
            } else {
                // get semester name
                let semesterHeader = transcript.slice(0,headerEndIndex);
                let semesterName = semesterHeader.match(/(SPRING|FALL|SUMMER)\s+[0-9]{4}/gmi);
                
                // get semester course numbers
                let semesterEndIndex = transcript.indexOf(sectionEnd);
                let courseNums = getCourseNums(transcript.slice(0,semesterEndIndex));
                
                return { name: semesterName, courses: courseNums, endIndex: semesterEndIndex};
            }
        };
        
        let externalCourses, transferCourses, sem;
        
        /* Algorithm: Find external/transfer if exists first. Then keep on checking for regular          semesters and remove from string, when can't find any more semesters you are finished */
        let endIndex = getSpecialEndIndex(transcript, 'EXTERNAL EXAMINATIONS');
        if (endIndex !== -1) {
            externalCourses = getCourseNums(transcript.slice(0,endIndex));
            transcript = transcript.slice(endIndex + sectionEnd.length);
        }
        console.log('External Examinations');
        console.log(externalCourses);
        endIndex = getSpecialEndIndex(transcript, 'TRANSFER COURSES');
        if (endIndex !== -1) {
            transferCourses = getCourseNums(transcript.slice(0,endIndex));
            transcript = transcript.slice(endIndex + sectionEnd.length);
        }
        console.log('Transfer Courses');
        console.log(transferCourses);
        
        while (true) {
            sem = getEndIndex(transcript);
            if (sem === -1) {
                break;
            } else {
                console.log(sem.name);
                console.log(sem.courses);
                transcript = transcript.slice(sem.endIndex + sectionEnd.length);
            }
        }
        
//        // Render text
//        for(var i = 0;i < pagesText.length;i++){
//        	$("#pdf-text").append("<div><h3>Page "+ (i + 1) +"</h3><p>"+pagesText[i]+"</p><br></div>")
//        }
    });

}, function (reason) {
    // PDF loading error
    console.error(reason);
});

/**
 * Retrieves the text of a specif page within a PDF Document obtained through pdf.js 
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