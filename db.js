require('dotenv').config();

// Configuration object for the dev environment
const devConfig = {
	user: process.env.PGUSER,
	password: process.env.PGPASSWORD,
	host: process.env.PGHOST,
	database: process.env.PGDATABASE,
	port: process.env.PGPORT,
	ssl: {
		rejectUnauthorized: false
	},
	debug: true
}

// Configuration object for the prod environment
const prodConfig = {
	connectionString: process.env.DATABASE_URL //heroku addons
}

const db = require('knex')({
	// determines which client adapter will be used with knex (required)
	client: "pg",
	// deploy using either prod or dev configuration
	connection: (process.env.NODE_ENV === 'production' ? prodConfig : devConfig)
});

module.exports = db;
