import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const pgp = pgPromise({
  // Initialization options
  capSQL: true, // capitalize SQL queries
  // Add event handlers here
  error: (err, e) => {
    if (e.cn) {
      // Connection-related error
      console.error('Database connection error:', err);
    } else {
      // Query-related error
      console.error('Database query error:', err);
    }
  },
});

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'sequence_game',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 30, // Maximum number of connection pool clients
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
};

// Create the database instance with a connection pool
const db = pgp(dbConfig);

// Test the connection
db.connect()
  .then((obj) => {
    console.log('Database connection successful');
    obj.done(); // success, release the connection
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });

export { db, pgp }; 