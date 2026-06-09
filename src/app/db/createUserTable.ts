import { pool } from "./db.js";



export const createUserTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,

      name VARCHAR(100) NOT NULL,

      email VARCHAR(255) UNIQUE NOT NULL,

      password TEXT NOT NULL,

      role VARCHAR(20) NOT NULL DEFAULT 'contributor'
      CHECK (role IN ('contributor', 'maintainer')),

      created_at TIMESTAMP NOT NULL DEFAULT NOW(),

      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

    await pool.query(query);

};