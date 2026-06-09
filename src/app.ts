
import express, { type Application, type Request, type Response } from "express"
const app: Application = express()

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({
    extended: true
}));                           // Form data

app.get('/', (req: Request, res: Response) => {
    app.get('/', (req: Request, res: Response) => {
        res.status(200).json({
            success: true,
            message: 'TS Server API is running successfully'
        })
    })
})


export default app
