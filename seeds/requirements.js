
exports.seed = function(knex, Promise) {
    return knex('requirements').del()
        .then(function () {
            return knex('requirements').insert([
                { code: 'NS', name: 'Natural Sciences' },
                { code: 'SCL', name: 'Social Analysis' },
                { code: 'HST', name: 'Historical Analysis' },
                { code: 'WC', name: 'Writing & Communication' },
                { code: 'WCr', name: 'Writing & Communication' },
                { code: 'WCd', name: 'Writing & Communication' },
                { code: 'CC', name: 'Contemporary Challenges' },
                { code: 'QQ', name: 'Quantitative & Formal Reasoning' },
                { code: 'QR', name: 'Quantitative & Formal Reasoning' },
                { code: 'AHo', name: 'Arts & Humanities' },
                { code: 'AHp', name: 'Arts & Humanities' },
                { code: 'AHq', name: 'Arts & Humanities' },
                { code: 'AHr', name: 'Arts & Humanities' },
                { code: 'ITR', name: 'Information Technology & Research' }
            ]);
        });
};
