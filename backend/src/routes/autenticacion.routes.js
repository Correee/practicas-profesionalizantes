import express from "express"
import {
    login,
    registrar
} from "../controllers/autenticacion.controller.js"

const autenticacionRouter = express.Router()

autenticacionRouter.post("/login", login)
autenticacionRouter.post("/register", registrar)

export default autenticacionRouter
