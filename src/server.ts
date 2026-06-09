import app from "./app.js"
import { envConfig } from "./app/config/env.js"
import { initDB, pool } from "./app/db/db.js"



const startServer = async () => {
    try {
        pool.query("SELECT 1")
        console.log("✅ Database connect successfully!!")
        
        await initDB()

        app.listen(envConfig.PORT, () => {
            console.log(`🚀 Server running on port ${envConfig.PORT}`);
        })
    } catch (error) {
        console.error("❌ Startup failed:", error);
        process.exit(1)
    }
}


startServer()