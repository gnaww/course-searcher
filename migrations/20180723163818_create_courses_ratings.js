
exports.up = function(knex, Promise) {
    return knex.schema.createTable('courses_ratings', function(t) {
        t.text('course').notNullable();
        t.text('average_rating').notNullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('courses_ratings');
};
