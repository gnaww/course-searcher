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
}

module.exports = User;
