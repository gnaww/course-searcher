
exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', function(t) {
        t.text('username').notNullable();
        t.text('password').notNullable();
        t.unique('username');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('users');
};
