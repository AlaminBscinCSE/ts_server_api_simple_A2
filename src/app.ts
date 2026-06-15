import express, {
    type Application,
    type NextFunction,
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


// Global Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {

    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

export default app;