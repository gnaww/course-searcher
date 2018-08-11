
exports.up = function(knex, Promise) {
    return knex.schema.createTable('courses_requirements', function(t) {
        t.text('course').notNullable();
        t.text('requirement').notNullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('courses_requirements');
};
