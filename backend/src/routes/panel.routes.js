import express from "express"
import {
    publicarProducto
} from "../controllers/panel.controller.js"
import { verificarToken, soloAdmin } from "../middlewares/autenticacion.middleware.js"

const panelRouter = express.Router()

panelRouter.post("/", verificarToken, soloAdmin, publicarProducto)

export default panelRouter