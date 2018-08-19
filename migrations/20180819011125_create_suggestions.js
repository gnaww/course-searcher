
exports.up = function(knex, Promise) {
    return knex.schema.createTable('suggestions', function(t) {
        t.increments('id');
        t.text('suggestion').notNullable();
        t.text('category').notNullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('suggestions');
};
