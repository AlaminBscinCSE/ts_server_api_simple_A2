import express, {
    type Application,
    type Request,
    type Response,
} from "express";

import router from "./app/routes/index.js";

const app: Application = express();

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "TS Server API is running successfully",
    });
});

app.use("/api", router);

export default app;