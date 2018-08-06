$( document ).ready(function() {
    $('.class-open').click(function(event){
        $(event.currentTarget).parent().hide();
        $(event.currentTarget).fadeOut(300, function(){
            $(event.currentTarget).parent().next().fadeIn(300);
        });
    });
    $('.register-button').click(function(event){
        $(event.currentTarget).fadeOut(300, function(){
            $(event.currentTarget).prev().show();
            $(event.currentTarget).prev().children().fadeIn(300);
        });
    });

    // Only execute this jquery if browser width is desktop size on page load
    if($(window).width() >= 1538.02){
        $('.column-left').css("height", "auto");
        $('.column-right').height($('.column-left').height());
        $(".class-comments").css("max-height", ($(".column-right").height()-$(".class-rating").height()-$(".add-comments").height()));
    }

    // fix for if they resize window manually
    $(window).resize(function() {
        if( $(window).width() > 1538.02) {
            $('.column-left').css("height", "auto");
            $('.column-right').height($('.column-left').height());
            $(".class-comments").css("max-height", ($(".column-right").height()-$(".class-rating").height()-$(".add-comments").height()));
        }
    });
});

// Turn on Bootstrap tooltips
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});
