
exports.up = function(knex, Promise) {
    return knex.schema.createTable('users_courses', function(t) {
        t.text('username').notNullable();
        t.jsonb('courses').notNullable();
        t.unique('username');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('users_courses');
};
