
exports.up = function(knex, Promise) {
    return knex.schema.createTable('comments', function(t) {
        t.text('comment').notNullable();
        t.integer('rating').notNullable();
        t.timestamp('date').defaultTo(knex.fn.now());
        t.text('course').notNullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('comments');
};
