
exports.up = function(knex, Promise) {
    return knex.schema.dropTableIfExists('ratings');
};

exports.down = function(knex, Promise) {
    return knex.schema.createTable('ratings', function(t) {
        t.text('course').notNullable();
        t.decimal('average_rating').notNullable();
    });
};
