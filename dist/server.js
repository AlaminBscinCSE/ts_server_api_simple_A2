
   import { createRequire } from 'module';
   const require = createRequire(import.meta.url);
  

// src/app.ts
import express from "express";

// src/app/routes/index.ts
import { Router as Router3 } from "express";

// src/app/modules/auth/auth.route.ts
import { Router } from "express";

// src/app/modules/auth/auth.service.ts
import jwt from "jsonwebtoken";

// src/app/db/db.ts
import { Pool } from "pg";

// src/app/config/env.ts
import dotenv from "dotenv";

// src/app/utils/helper.ts
var getEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

// src/app/config/env.ts
dotenv.config();
var envConfig = {
  PORT: Number(process.env.PORT) || 5e3,
  DB_CONNECTION: getEnv("DB_CONNECTION"),
  JWT_SECRET: getEnv("JWT_SECRET")
};

// src/app/db/createUserTable.ts
var createUserTable = async () => {
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

// src/app/db/createIssueTable.ts
var createIssueTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS issues (
      id SERIAL PRIMARY KEY,

      title VARCHAR(150) NOT NULL,

      description TEXT NOT NULL,

      type VARCHAR(20) NOT NULL
      CHECK (type IN ('bug', 'feature_request')),

      status VARCHAR(20) NOT NULL DEFAULT 'open'
      CHECK (status IN ('open', 'in_progress', 'resolved')),

      reporter_id INT NOT NULL,

      created_at TIMESTAMP NOT NULL DEFAULT NOW(),

      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;
  await pool.query(query);
};

// src/app/db/db.ts
var pool = new Pool({
  connectionString: envConfig.DB_CONNECTION
});
var initDB = async () => {
  await createUserTable();
  await createIssueTable();
};

// src/app/modules/auth/auth.service.ts
import bcrypt from "bcrypt";
var userRegistered = async (payload) => {
  const { name, email, password, role } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
    INSERT INTO users (
      name,
      email,
      password,
      role
    )
    VALUES ($1, $2, $3,COALESCE($4, 'contributor')
    RETURNING*
    `,
    [name, email, hashedPassword, role]
  );
  delete result.rows[0].password;
  return result.rows[0];
};
var userLogin = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
        SELECT*FROM users WHERE email=$1
        `,
    [email]
  );
  if (userData.rows.length == 0) {
    throw new Error("Invalid credential");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invalid credential");
  }
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const token = jwt.sign(
    jwtPayload,
    envConfig.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );
  delete user.password;
  return {
    token,
    user
  };
};
var authService = {
  userRegistered,
  userLogin
};

// src/app/utils/sendResponse.ts
var sendResponse = (res, statusCode, message, data) => {
  const response = {
    success: true,
    message,
    data
  };
  return res.status(statusCode).json(response);
};

// src/app/utils/sendError.ts
var sendError = (res, statusCode, message, errors) => {
  const response = {
    success: false,
    message,
    errors
  };
  return res.status(statusCode).json(response);
};

// src/app/modules/auth/auth.controller.ts
var userRegistered2 = async (req, res) => {
  try {
    const result = await authService.userRegistered(req.body);
    return sendResponse(
      res,
      201,
      "User registered successfully",
      result
    );
  } catch (error) {
    sendError(
      res,
      400,
      error instanceof Error ? error.message : "something went wrong",
      error
    );
  }
};
var userLogin2 = async (req, res) => {
  try {
    const result = await authService.userLogin(req.body);
    return sendResponse(
      res,
      200,
      "Login successful",
      result
    );
  } catch (error) {
    sendError(
      res,
      400,
      error instanceof Error ? error.message : "something went wrong",
      error
    );
  }
};
var authController = {
  userRegistered: userRegistered2,
  userLogin: userLogin2
};

// src/app/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.userRegistered);
router.post("/login", authController.userLogin);
var authRoutes = router;

// src/app/modules/issue/issue.route.ts
import { Router as Router2 } from "express";

// src/app/modules/issue/issue.service.ts
var issueCreated = async (payload, reporterId) => {
  const { title, description, type, status = "open" } = payload;
  const result = await pool.query(
    `
        INSERT INTO issues (
            title,
            description,
            type,
            status,
            reporter_id
        )
        VALUES ($1, $2, $3, $4,$5)
        RETURNING *
        `,
    [title, description, type, status, reporterId]
  );
  return result.rows[0];
};
var getAllIssues = async (query) => {
  const {
    sort = "newest",
    type,
    status
  } = query;
  let sql = `
        SELECT * FROM issues
        WHERE 1=1
    `;
  const values = [];
  if (type) {
    values.push(type);
    sql += `
            AND type = $${values.length}
        `;
  }
  if (status) {
    values.push(status);
    sql += `
            AND status = $${values.length}
        `;
  }
  sql += `
        ORDER BY created_at
        ${sort === "oldest" ? "ASC" : "DESC"}
    `;
  const issuesResult = await pool.query(
    sql,
    values
  );
  const issues = issuesResult.rows;
  const reporterIds = issues.map(
    (issue) => issue.reporter_id
  );
  const usersResult = await pool.query(
    `
        SELECT
            id,
            name,
            role
        FROM users
        WHERE id = ANY($1)
        `,
    [reporterIds]
  );
  const reporters = usersResult.rows;
  const finalIssues = issues.map((issue) => {
    const reporter = reporters.find((reporter2) => reporter2.id == issue.reporter_id);
    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter,
      created_at: issue.created_at,
      updated_at: issue.updated_at
    };
  });
  return finalIssues;
};
var getSingleIssue = async (id) => {
  const issueResult = await pool.query(
    `
        SELECT * FROM issues
        WHERE id = $1
        `,
    [id]
  );
  const issue = issueResult.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  const userResult = await pool.query(
    `
        SELECT id, name, role
        FROM users
        WHERE id = $1
        `,
    [issue.reporter_id]
  );
  const reporter = userResult.rows[0];
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
};
var updateIssue = async (issueId, payload) => {
  const {
    title,
    description,
    type
  } = payload;
  const result = await pool.query(
    `
        UPDATE issues
        SET
            title = COALESCE($1, title),
            description = COALESCE($2, description),
            type = COALESCE($3, type),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
        `,
    [
      title,
      description,
      type,
      issueId
    ]
  );
  if (result.rows.length === 0) {
    throw new Error("Issue not found");
  }
  return result.rows[0];
};
var deleteIssue = async (issueId) => {
  const result = await pool.query(
    `
        DELETE FROM issues
        WHERE id = $1
        RETURNING *
        `,
    [issueId]
  );
  if (result.rows.length === 0) {
    throw new Error("Issue not found");
  }
  return null;
};
var issueService = {
  issueCreated,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/app/modules/issue/issue.controller.ts
var issueCreated2 = async (req, res) => {
  try {
    const reporter_id = req.user.id;
    const result = await issueService.issueCreated(req.body, reporter_id);
    return sendResponse(
      res,
      201,
      "Issue created successfully",
      result
    );
  } catch (error) {
    sendError(
      res,
      500,
      error instanceof Error ? error.message : "something went wrong",
      error
    );
  }
};
var getAllIssues2 = async (req, res) => {
  try {
    const result = await issueService.getAllIssues(
      req.query
    );
    return sendResponse(
      res,
      200,
      "Issues retrieved successfully",
      result
    );
  } catch (error) {
    return sendError(
      res,
      500,
      error instanceof Error ? error.message : "Something went wrong",
      error
    );
  }
};
var getSingleIssue2 = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await issueService.getSingleIssue(id);
    return sendResponse(
      res,
      200,
      "Issue retrieved successfully",
      result
    );
  } catch (error) {
    return sendError(
      res,
      500,
      error instanceof Error ? error.message : "Something went wrong",
      error
    );
  }
};
var updateIssue2 = async (req, res) => {
  try {
    const issueId = Number(req.params.id);
    const result = await issueService.updateIssue(
      issueId,
      req.body
    );
    return sendResponse(
      res,
      200,
      "Issue updated successfully",
      result
    );
  } catch (error) {
    return sendError(
      res,
      500,
      error instanceof Error ? error.message : "Something went wrong",
      error
    );
  }
};
var deleteIssue2 = async (req, res) => {
  try {
    const issueId = Number(req.params.id);
    await issueService.deleteIssue(issueId);
    return res.status(200).json({
      success: true,
      message: "Issue deleted successfully"
    });
  } catch (error) {
    return sendError(
      res,
      500,
      error instanceof Error ? error.message : "Something went wrong",
      error
    );
  }
};
var issueController = {
  issueCreated: issueCreated2,
  getAllIssues: getAllIssues2,
  getSingleIssue: getSingleIssue2,
  updateIssue: updateIssue2,
  deleteIssue: deleteIssue2
};

// src/app/middleware/verifyToken.ts
import jwt2 from "jsonwebtoken";
var verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return sendError(
        res,
        401,
        "Unauthorized",
        "Token is required"
      );
    }
    const decoded = jwt2.verify(
      token,
      envConfig.JWT_SECRET
    );
    const userData = await pool.query(
      `
            SELECT
                id,
                name,
                email,
                role
            FROM users
            WHERE email = $1
            `,
      [decoded.email]
    );
    if (userData.rows.length === 0) {
      return sendError(
        res,
        404,
        "User not found",
        null
      );
    }
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(
      res,
      401,
      "Invalid or expired token",
      error
    );
  }
};

// src/app/middleware/canUpdateIssue.ts
var canUpdateIssue = async (req, res, next) => {
  try {
    const issueId = Number(req.params.id);
    const user = req.user;
    const result = await pool.query(
      `SELECT * FROM issues WHERE id = $1`,
      [issueId]
    );
    const issue = result.rows[0];
    if (!issue) {
      return sendError(res, 404, "Issue not found", null);
    }
    if (user?.role == "maintainer") {
      return next();
    }
    if (user?.role === "contributor") {
      if (user?.id !== issue.reporter_id) {
        return sendError(
          res,
          403,
          "You can only update your own issues",
          null
        );
      }
      if (issue.status !== "open") {
        return sendError(
          res,
          409,
          "You can only update open issues",
          null
        );
      }
      return next();
    }
    return sendError(res, 403, "Forbidden", null);
  } catch (error) {
    return sendError(
      res,
      500,
      error instanceof Error ? error.message : "Server error",
      error
    );
  }
};
var canUpdateIssue_default = canUpdateIssue;

// src/app/middleware/canDeleteIssue.ts
var canDeleteIssue = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return sendError(
        res,
        401,
        "Unauthorized",
        null
      );
    }
    if (user.role !== "maintainer") {
      return sendError(
        res,
        403,
        "Only maintainers can delete issues",
        null
      );
    }
    next();
  } catch (error) {
    return sendError(
      res,
      500,
      "Internal server error",
      error
    );
  }
};
var canDeleteIssue_default = canDeleteIssue;

// src/app/modules/issue/issue.route.ts
var router2 = Router2();
router2.post("/", verifyToken, issueController.issueCreated);
router2.get("/", issueController.getAllIssues);
router2.get("/:id", issueController.getSingleIssue);
router2.patch("/:id", verifyToken, canUpdateIssue_default, issueController.updateIssue);
router2.delete("/:id", verifyToken, canDeleteIssue_default, issueController.deleteIssue);
var issueRoutes = router2;

// src/app/routes/index.ts
var router3 = Router3();
var moduleRoutes = [
  {
    path: "/auth",
    route: authRoutes
  },
  {
    path: "/issues",
    route: issueRoutes
  }
];
moduleRoutes.forEach((route) => {
  router3.use(route.path, route.route);
});
var routes_default = router3;

// src/app.ts
var app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "TS Server API is running successfully"
  });
});
app.use("/api", routes_default);
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});
var app_default = app;

// src/server.ts
var startServer = async () => {
  try {
    pool.query("SELECT 1");
    console.log("\u2705 Database connect successfully!!");
    await initDB();
    app_default.listen(envConfig.PORT, () => {
      console.log(`\u{1F680} Server running on port ${envConfig.PORT}`);
    });
  } catch (error) {
    console.error("\u274C Startup failed:", error);
    process.exit(1);
  }
};
startServer();
//# sourceMappingURL=server.js.map