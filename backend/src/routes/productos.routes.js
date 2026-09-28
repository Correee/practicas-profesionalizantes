import express from "express"
import {
    obtenerProductos
} from "../controllers/productos.controller.js"

const productosRouter = express.Router()

productosRouter.get("/", obtenerProductos)

export default productosRouter