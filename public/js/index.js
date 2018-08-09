$( document ).ready(function() {
    $('#requirement-select').click(function() {
        $('#direct-search').hide();
        $('#requirement-search').fadeIn(500);
        $('#requirement-select').addClass('btn-active');
        $('#direct-select').removeClass('btn-active');
    });

    $('#direct-select').click(function() {
        $('#requirement-search').hide();
        $('#direct-search').fadeIn(500);
        $('#requirement-select').removeClass('btn-active');
        $('#direct-select').addClass('btn-active');
    });
});

// get current url: document.URL
// check if personalize is checked  var checkedValue = document.querySelector('#personalize:checked').value;\
// redirect to url window.location.href = "http://stackoverflow.com";

// Enable Bootstrap tooltips
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})
