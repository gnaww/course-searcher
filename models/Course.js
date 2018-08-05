const { Model } = require('objection')

class Course extends Model {
    static get tableName() {
        return 'courses';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['course_unit', 'course_subject', 'course_number', 'course_full_number', 'name', 'section_number', 'section_index', 'section_open_status', 'instructors', 'times', 'notes', 'exam_code', 'campus', 'credits', 'url', 'pre_reqs', 'core_codes', 'last_updated'],

            properties: {
                course_unit: { type: 'number' },
                course_subject: { type: 'number' },
                course_number: { type: 'number' },
                course_full_number: { type: 'string', pattern: "^[0-9]{2}:[0-9]{3}:[0-9]{3}$" },
                name: { type: 'string'},
                section_number: { type: 'string', minLength: 2, maxLength: 2 },
                section_index: { type: 'number' },
                section_open_status: { type: 'string', pattern: "^(OPEN)|(CLOSED)$"},
                instructors: { type: 'string' },
                times: { type: 'array'},
                notes: { type: 'string' },
                exam_code: { type: 'string', minLength: 1, maxLength: 1 },
                campus: { type: 'string', minLength: 2, maxLength: 2 },
                credits: { type: 'number', minimum: 0 },
                url: { type: 'string' },
                pre_reqs: { type: 'string' },
                core_code: { type: ['object', 'array'] },
                last_updated: { type: 'string', pattern: "^[0-9]{2}-[0-9]{2}-[0-9]{4}\s[0-9]{2}:[0-9]{2}$" }
            }
        };
    }

    static get relationMappings() {
        const Requirement = require('./Requirement');
        const User = require('./User');
        const Comment = require('./Comment');
        const Rating = require('./Rating');

        return {
            requirements: {
                relation: Model.ManyToManyRelation,
                modelClass: Requirement,
                join: {
                    from: 'courses.course_full_number',
                    through: {
                        from: 'courses_requirements.course',
                        to: 'courses_requirements.requirement'

                        // If you have a model class for the join table
                        // you can specify it like this:
                        //
                        // modelClass: PersonMovie,

                        // Columns listed here are automatically joined
                        // to the related models on read and written to
                        // the join table instead of the related table
                        // on insert.
                        //
                        // extra: ['someExtra']
                    },
                    to: 'requirements.code'
                }
            },

            comments: {
                relation: Model.HasManyRelation,
                modelClass: Comment,
                join: {
                    from: 'courses.course_full_number',
                    to: 'comments.course'
                }
            },

            ratings: {
                relation: Model.BelongsToOneRelation,
                modelClass: Rating,
                join: {
                    from: 'courses.course_full_number',
                    to: 'ratings.course'
                }
            }
        };
    }
}

module.exports = Course;
