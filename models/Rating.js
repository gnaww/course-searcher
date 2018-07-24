const { Model } = require('objection')

class Rating extends Model {
    static get tableName() {
        return 'ratings';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['course', 'average_rating'],

            properties: {
                course: { type: 'string', pattern: "^[0-9]{2}:[0-9]{3}:[0-9]{3}$" },
                average_rating: { type: 'number' }
                
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
                    from: 'ratings.course',
                    to: 'courses.course_full_number'
                }
            }
        };
    }
}

module.exports = Rating;