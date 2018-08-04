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
                    Successfully saved completed classes! <a href="/account" class="alert-link">Refresh</a> the page to view the changes.
                    <button type='button' class='close' data-dismiss='alert' aria-label='Close'>
                        <span aria-hidden='true'>&times;</span>
                    </button>
                </div>` ).insertBefore( ".container-fluid" );
            $('#auto-modal').modal('toggle');
            $('.save-button').hide();
        })
        .catch(err => {
            $( `<div class='alert alert-danger alert-dismissible fade show' role='alert'>
                    Something went wrong :(. <a href="/account" class="alert-link">Refresh</a> the page and try again.
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
    // parse submitted courses in the textarea
});

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

});

// Turn on Bootstrap tooltips
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});
