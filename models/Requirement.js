const { Model } = require('objection')

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
        const Course = require('./Course');

        return {
            courses: {
                relation: Model.ManyToManyRelation,
                modelClass: Course,
                join: {
                    from: 'requirements.code',
                    through: {
                        from: 'courses_requirements.requirement',
                        to: 'courses_requirements.course'
                    },
                    to: 'courses.course_full_number'
                }
            }
        };
    }
}

module.exports = Requirement;
