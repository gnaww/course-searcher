
exports.up = function(knex, Promise) {
    return knex.schema.table('comments', function(table) {
        table.text('user').notNullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.table('comments', function(table) {
        table.dropColumn('user');
    })
};
