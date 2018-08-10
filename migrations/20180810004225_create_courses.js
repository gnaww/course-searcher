
exports.up = function(knex, Promise) {
    return knex.schema.createTable('courses', function(t) {
        t.integer('course_unit').notNullable();
        t.integer('course_subject').notNullable();
        t.integer('course_number').notNullable();
        t.text('course_full_number').notNullable();
        t.text('name').notNullable();
        t.string('section_number', 2).notNullable();
        t.integer('section_index').notNullable();
        t.text('section_open_status').notNullable();
        t.text('instructors').notNullable();
        t.jsonb('times').notNullable();
        t.text('notes').notNullable();
        t.string('exam_code', 1).notNullable();
        t.string('campus', 2).notNullable();
        t.decimal('credits', null).notNullable();
        t.text('url').notNullable();
        t.text('pre_reqs').notNullable();
        t.jsonb('core_codes').notNullable();
        t.text('last_updated').notNullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('courses');
};
