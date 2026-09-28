import db from "../config/db.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ mensaje: "Email y contraseña son obligatorios" })
    }

    try {
        const [usuarios] = await db.execute(
            "SELECT usuario_id, email, password_hash, rol FROM usuarios WHERE email = ?", [email]
        )

        if (usuarios.length === 0) {
            return res.status(401).json({ mensaje: "Credenciales incorrectas" })
        }

        const usuario = usuarios[0]
        const passwordValida = await bcrypt.compare(password, usuario.password_hash)

        if (!passwordValida) {
            return res.status(401).json({ mensaje: "Credenciales incorrectas" })
        }

        const token = jwt.sign(
            {
                usuario_id: usuario.usuario_id,
                rol: usuario.rol
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
        )

        return res.json({
            mensaje: "Login exitoso",
            token,
            usuario: {
                usuario_id: usuario.usuario_id,
                email: usuario.email,
                rol: usuario.rol
            }
        })
    } catch (error) {
        console.error("Error en login: ", error)
        res.status(500).json({ message: "Error interno del servidor" })
    }
}