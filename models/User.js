const { Model } = require('objection')

class User extends Model {
    static get tableName() {
        return 'users';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['username', 'password'],

            properties: {
                username: { type: 'string', minLength: 1, maxLength: 255 },
                password: { type: 'string', minLength: 5, maxLength: 255 }
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
                    from: 'users.username',
                    through: {
                        from: 'users_courses.username',
                        to: 'users_courses.course'

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

module.exports = User;