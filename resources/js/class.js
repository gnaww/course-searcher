$( document ).ready(function() {
    $('.class-open').click(function(event){  
        $(event.currentTarget).parent().hide();
        $(event.currentTarget).fadeOut(300, function(){
            $(event.currentTarget).parent().next().fadeIn(300);
        });
    });
    $('.register-button').click(function(event){    
        $(event.currentTarget).fadeOut(300, function(){
            $(event.currentTarget).prev().children().fadeIn(300);
        });
    });
});

// Turn on Bootstrap tooltips
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});