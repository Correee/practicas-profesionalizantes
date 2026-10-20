import express from "express"
import {
    actualizarProducto,
    eliminarProducto,
    obtenerProductosAdmin,
    publicarProducto
} from "../controllers/panel.controller.js"
import { verificarToken, soloAdmin } from "../middlewares/autenticacion.middleware.js"

const panelRouter = express.Router()

panelRouter.use(verificarToken, soloAdmin)
panelRouter.get("/", obtenerProductosAdmin)
panelRouter.post("/", publicarProducto)
panelRouter.put("/:id", actualizarProducto)
panelRouter.delete("/:id", eliminarProducto)

export default panelRouter
