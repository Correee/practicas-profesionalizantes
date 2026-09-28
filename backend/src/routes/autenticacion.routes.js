import express from "express"
import {
    login
} from "../controllers/autenticacion.controller.js"

const autenticacionRouter = express.Router()

autenticacionRouter.get("/login", login)

export default autenticacionRouter