
exports.up = function(knex, Promise) {
    return knex.schema.createTable('requirements', function(t) {
        t.text('code').notNullable();
        t.text('name').notNullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('requirements');
};
