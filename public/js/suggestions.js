$( document ).ready(function() {
    $('.suggestions-list').on('hide.bs.collapse', event => {
        let oldHTML = $(event.currentTarget).prev().html().trim();
        let newHTML = oldHTML.replace(/<i class="fas fa-minus"><\/i>/, '<i class="fas fa-plus"></i>')
        $(event.currentTarget).prev().html(newHTML);
    })
    $('.suggestions-list').on('show.bs.collapse', event => {
        let oldHTML = $(event.currentTarget).prev().html().trim();
        let newHTML = oldHTML.replace(/<i class="fas fa-plus"><\/i>/, '<i class="fas fa-minus"></i>')
        $(event.currentTarget).prev().html(newHTML);
    })
});
