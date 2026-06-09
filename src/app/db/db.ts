

import { Pool } from "pg";
import { envConfig } from "../config/env.js";
import { createUserTable } from "./createUserTable.js";
import { createIssueTable } from "./createIssueTable.js";


export const pool = new Pool({
    connectionString:envConfig.DB_CONNECTION
}) 

export const initDB = async () => {

  await createUserTable();
  await createIssueTable();

};