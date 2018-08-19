
exports.up = function(knex, Promise) {
    return knex.schema.createTable('news', function(t) {
        t.text('title').notNullable();
        t.text('content').notNullable();
        t.date('date').notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('news');
};
