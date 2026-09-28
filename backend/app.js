import express from "express"
import cors from "cors"

import productosRouter from "./src/routes/productos.routes.js"
import panelRouter from "./src/routes/panel.routes.js"
import autenticacionRouter from "./src/routes/autenticacion.routes.js"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/productos", productosRouter)
app.use("/admin/panel", panelRouter)
app.use("/auth", autenticacionRouter)

export default app