
exports.seed = function(knex, Promise) {
    return knex('ratings').del()
        .then(function () {
            return knex('ratings').insert([
                { course: '33:010:272', average_rating: 2 },
                { course: '33:010:273', average_rating: 4 },
                { course: '33:010:275', average_rating: 5 }
            ]);
        });
};
