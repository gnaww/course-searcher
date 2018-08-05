const { Model } = require('objection')

class Comment extends Model {
    static get tableName() {
        return 'comments';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['comment_text', 'rating', 'date', 'course', 'user'],

            properties: {
                comment_text: { type: 'string', minLength: 1 },
                rating: { type: 'number', minimum: 1, maximum: 5 },
                date: { type: 'string', pattern: "^[0-9]{2}-[0-9]{2}-[0-9]{4}$" },
                course: { type: 'string', pattern: "^[0-9]{2}:[0-9]{3}:[0-9]{3}$" },
                user: { type: 'string' }
            }
        };
    }

    static get relationMappings() {
        const Course = require('Course');

        return {
            courses: {
                relation: Model.BelongsToOneRelation,
                modelClass: Course,
                join: {
                    from: 'comments.course',
                    to: 'courses.course_full_number'
                }
            }
        };
    }
}

module.exports = Comment;
