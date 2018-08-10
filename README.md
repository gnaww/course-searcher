# Rutgers Course Searcher++
A better Rutgers University course search engine.

## To set up website locally
1. Install [NodeJS](https://nodejs.org/en/download/) and [PostgreSQL](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)

2. Clone this repository

3. Set up a database in PostgreSQL and edit `knexfile.js` in the root repository folder to match your database configuration.

4. Run `npm install`

5. Run `knex migrate:latest` and optionally run `knex seed:run` for some seeded comments/users

6. Run `npm start`
