
exports.up = function(knex, Promise) {
    return knex.schema.createTable('ratings', function(t) {
        t.text('course').notNullable();
        t.integer('average_rating').notNullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('ratings');
};
