
exports.up = function(knex, Promise) {
    return knex.schema.createTable('courses', function(t) {
        t.integer('course_unit').notNullable();
        t.integer('course_subject').notNullable();
        t.integer('course_number').notNullable();
        t.text('course_full_number').notNullable();
        t.text('name').notNullable();
        t.text('full_name');
        t.string('section_number', 2).notNullable();
        t.integer('section_index').notNullable();
        t.text('section_open_status').notNullable();
        t.text('instructors');
        t.jsonb('times');
        t.text('notes');
        t.string('exam_code', 1);
        t.string('campus', 2);
        t.decimal('credits', null).notNullable();
        t.text('url');
        t.text('pre_reqs');
        t.jsonb('core_codes');
        t.text('last_updated').notNullable();
        t.unique('section_index');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists('courses');
};
