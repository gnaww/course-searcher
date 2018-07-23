
exports.up = function(knex, Promise) {
    return knex.schema.createTable('users_courses', function(t) {
        t.text('username').notNullable();
        t.text('course').notNullable();
        t.text('semester').notNullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('users_courses');
};
