const Knex = require('knex')
const connection = require('../knexfile')
const { Model } = require('objection')

const knexConnection = Knex(connection)

Model.knex(knexConnection)

class Requirement extends Model {
    static get tableName() {
        return 'requirements';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['code', 'name'],

            properties: {
                code: { type: 'string', minLength: 1, maxLength: 3 },
                name: { type: 'string', minLength: 1, maxLength: 255 }
            }
        };
    }

    static get relationMappings() {
        const Course = require('Course');
        
        return {
            courses: {
                relation: Model.HasManyRelation,
                modelClass: Course,
                join: {
                    from: 'requirements.code',
                    through: {
                        from: 'courses_requirements.requirement',
                        to: 'courses_requirements.course'

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
                    to: 'courses.course_full_number'
                }
            }
        };
    }
}

module.exports = Requirement;