import { Router } from "express";
import { authRoutes } from "../modules/auth/auth.route.js";
import { issueRoutes } from "../modules/issue/issue.route.js";


const router = Router()

const moduleRoutes = [
    {
        path: "/auth",
        route: authRoutes
    },
    {
        path: "/issues",
        route: issueRoutes
    },
]

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})

export default router