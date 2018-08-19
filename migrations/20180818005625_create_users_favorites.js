
exports.up = function(knex, Promise) {
   return knex.schema.createTable('users_favorites', function(t) {
        t.text('username').notNullable();
        t.jsonb('courses').nullable();
        t.jsonb('sections').nullable();
        t.unique('username');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('users_favorites');
};
