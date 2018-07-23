
exports.seed = function(knex, Promise) {
    return knex('users').del()
        .then(function () {
            return knex('users').insert([
                // password: password
                { username: 'will', password: '$2a$10$pn8KdEW2BJhxBFlnlN7fl.YDxnAtYEb1vUDNGa1WOpA1/ukscur7C' },
                //password: fireteam
                { username: 'ray', password: '$2a$10$EZZTb6V4O7ogmu/LNIA6aO1y9MGez.9Tx7C3R9wL5hQl6.BuYG4Xm' }
            ]);
        });
};
