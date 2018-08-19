const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || '';

module.exports = {
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: DATABASE_PASSWORD,
        database: 'course-planner'
    }
};
