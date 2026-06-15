import { pool } from "../../db/db.js";
import type { Issue } from "./issue.interface.js"


const issueCreated = async (
    payload: Issue,
    reporterId: number
) => {

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

const getAllIssues = async (
    query: Record<string, any>
) => {
    const {
        sort = "newest",
        type,
        status
    } = query;

    let sql = `
        SELECT * FROM issues
        WHERE 1=1
    `;

    const values: unknown[] = [];

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
        issue => issue.reporter_id
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
    const reporters = usersResult.rows
    const finalIssues = issues.map(issue => {
        const reporter = reporters.find((reporter) => reporter.id == issue.reporter_id)

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


const getSingleIssue = async (id: number) => {
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

export const issueService = {
    issueCreated,
    getAllIssues,
    getSingleIssue
}