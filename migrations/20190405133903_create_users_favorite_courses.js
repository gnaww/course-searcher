
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users_favorite_courses', function(t) {
        t.text('username').notNullable().references('username').inTable('users');
        t.jsonb('course').notNullable().references('course_full_number').inTable('courses');
        t.unique(['username', 'course']);
    });
};

exports.down = function(knex, Promise) {
      return knex.schema.dropTableIfExists('users_favorite_courses');
};
