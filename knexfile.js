//
// module.exports = {
//     client: 'pg',
//     connection: {
//         host: '127.0.0.1',
//         user: 'postgres',
//         password: 'redskies',
//         database: 'course-planner'
//     }
// };

module.exports = {
    production: {
        client: 'postgresql',
        connection: process.env.DATABASE_URL
    }
};
