import jwt from "jsonwebtoken"

export const verificarToken = (req, res, next) => {
    const authorization = req.headers.authorization

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({ mensaje: "Token de acceso requerido" })
    }

    const token = authorization.split(" ")[1]

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.usuario = payload
        next()
    } catch (error) {
        return res.status(401).json({ mensaje: "Token inválido o vencido" })
    }
}

export const soloAdmin = (req, res, next) => {
    if (req.usuario?.rol !== "Admin") {
        return res.status(403).json({ mensaje: "No tienes permiso para realizar esta acción" })
    }

    next()
}