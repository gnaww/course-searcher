$( document ).ready(function() {
    $('#requirement-select').click(function() {
        $('#direct-search').hide();
        $('#requirement-search').fadeIn(500);
        $('#requirement-select').addClass('btn-active');
        $('#direct-select').removeClass('btn-active');
        $('#search-results').remove();
    });

    $('#direct-select').click(function() {
        $('#requirement-search').hide();
        $('#direct-search').fadeIn(500);
        $('#requirement-select').removeClass('btn-active');
        $('#direct-select').addClass('btn-active');
        $('#search-results').remove();
    });

    const requirements = ['NS', 'SCL', 'HST', 'WC', 'WCr', 'WCd', 'CC', 'QQ', 'QR', 'AHo', 'AHp', 'AHq', 'AHr', 'ITR'];

    $('#clear-form').click(function() {
        for (let i = 0; i < requirements.length; i++) {
            $(`#${requirements[i]}`).removeAttr('checked');
        }
    });

    $('#personalize').change(function() {
        let url = document.URL;
        const personalizeIndex = url.indexOf('&personalize');
        if (personalizeIndex !== -1) {
            url = url.slice(0,personalizeIndex);
            url = `${url}&personalize=${document.getElementById('personalize').checked}#search-results`;
        } else {
            url = `${url}&personalize=${document.getElementById('personalize').checked}#search-results`;
        }
        window.location.href = url;
    });

    $('#requirement-asc').click(function() {
        redirect('requirement-asc')
    });

    $('#requirement-desc').click(function() {
        redirect('requirement-desc');
    });

    $('#number-asc').click(function() {
        redirect('number-asc');
    });

    $('#number-desc').click(function() {
        redirect('number-desc');
    });

    $('#name-asc').click(function() {
        redirect('name-asc');
    });

    $('#name-desc').click(function() {
        redirect('name-desc');
    });

    $('#credits-asc').click(function() {
        redirect('credits-asc');
    });

    $('#credits-desc').click(function() {
        redirect('credits-desc');
    });
});

const redirect = sortType => {
    let url = document.URL;
    let params = sortType.split('-');

    const sortIndex = url.indexOf('&sort') === -1 ? Number.MAX_VALUE : url.indexOf('&sort');
    const orderIndex = url.indexOf('&order') === -1 ? Number.MAX_VALUE : url.indexOf('&order');
    const personalizeIndex = url.indexOf('&personalize') === -1 ? Number.MAX_VALUE : url.indexOf('&personalize');

    url = url.slice(0, Math.min(sortIndex, orderIndex, personalizeIndex));

    const personalizeCheck = document.getElementById('personalize');

    if (personalizeCheck) {
        const personalize = personalizeCheck.checked;
        url = `${url}&sort=${params[0]}&order=${params[1]}&personalize=${personalize}#search-results`;
    } else {
        url = `${url}&sort=${params[0]}&order=${params[1]}#search-results`;
    }

    window.location.href = url;
};

// Enable Bootstrap tooltips
$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})
