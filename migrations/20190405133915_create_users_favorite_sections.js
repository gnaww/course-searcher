
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users_favorite_sections', function(t) {
        t.text('username').notNullable().references('username').inTable('users');
        t.jsonb('section').notNullable().references('section_index').inTable('sections');
        t.unique(['username', 'section']);
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('users_favorite_sections');
};
