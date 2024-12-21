import pgPromise from "pg-promise";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const pgp = pgPromise();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'sequence_game',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 30, // Maximum number of connection pool clients
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
};

const db = pgp(dbConfig);

export default db;
