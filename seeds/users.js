
exports.seed = function(knex, Promise) {
    return knex('users').del()
        .then(function () {
            return knex('users').insert([
                // password: password
                { username: 'admin', password: '$2a$10$PhJX9KfXylhPuKNHAdhn9ONoliIDsIgeyeGNvUqqhQn.GbmlrMi8q' },
                // password: willpassword
                { username: 'will', password: '$2a$10$BOMsGJU30rth59nO0JQ0Me1ZQ5MD7ZFsBOPvretD8O2ITJt4GAo3a' },
                //password: fireteam
                { username: 'ray', password: '$2a$10$EZZTb6V4O7ogmu/LNIA6aO1y9MGez.9Tx7C3R9wL5hQl6.BuYG4Xm' }
            ]);
        });
};
