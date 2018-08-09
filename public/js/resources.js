$( document ).ready(function() {
    let shown = false;
    $(window).scroll(function() {
        if ($(this).scrollTop() > 600) {
            if (!shown) {
                $('.back-to-top').animate({width: 'toggle'});
                shown = true;
            }
        } else {
            if (shown) {
                $('.back-to-top').animate({width: 'toggle'});
                shown = false;
            }
        }
    });

    $('.back-to-top').click(function(event) {
        event.preventDefault();
        $('html, body').animate({scrollTop: 0}, 300);
        return false;
    })
});
