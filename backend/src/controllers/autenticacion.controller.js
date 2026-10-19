import db from "../config/db.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const registrar = async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : ""
    const password = typeof req.body?.password === "string" ? req.body.password : ""

    if (!email || !password) {
        return res.status(400).json({ mensaje: "Email y contraseña son obligatorios" })
    }

    if (!emailValido(email)) {
        return res.status(400).json({ mensaje: "El email no tiene un formato válido" })
    }

    if (password.length < 8) {
        return res.status(400).json({ mensaje: "La contraseña debe tener al menos 8 caracteres" })
    }

    if (Buffer.byteLength(password, "utf8") > 72) {
        return res.status(400).json({ mensaje: "La contraseña no puede superar los 72 bytes" })
    }

    try {
        const [usuariosExistentes] = await db.execute(
            "SELECT usuario_id FROM usuarios WHERE email = ? LIMIT 1",
            [email]
        )

        if (usuariosExistentes.length > 0) {
            return res.status(409).json({ mensaje: "Ya existe una cuenta con ese email" })
        }

        const passwordHash = await bcrypt.hash(password, 12)
        const rol = "Cliente"
        const [resultado] = await db.execute(
            "INSERT INTO usuarios (email, password_hash, rol) VALUES (?, ?, ?)",
            [email, passwordHash, rol]
        )

        return res.status(201).json({
            mensaje: "Cuenta creada correctamente",
            usuario: {
                usuario_id: resultado.insertId,
                email,
                rol
            }
        })
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ mensaje: "Ya existe una cuenta con ese email" })
        }

        console.error("Error al registrar usuario: ", error)
        return res.status(500).json({ mensaje: "No se pudo crear la cuenta" })
    }
}

export const login = async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : ""
    const password = typeof req.body?.password === "string" ? req.body.password : ""

    if (!email || !password) {
        return res.status(400).json({ mensaje: "Email y contraseña son obligatorios" })
    }

    if (!emailValido(email)) {
        return res.status(400).json({ mensaje: "El email no tiene un formato válido" })
    }

    if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET no está configurado")
        return res.status(500).json({ mensaje: "Error interno del servidor" })
    }

    try {
        const [usuarios] = await db.execute(
            "SELECT usuario_id, email, password_hash, rol FROM usuarios WHERE email = ?", [email]
        )

        if (usuarios.length === 0) {
            return res.status(401).json({ mensaje: "Credenciales incorrectas" })
        }

        const usuario = usuarios[0]
        if (typeof usuario.password_hash !== "string" || !usuario.password_hash) {
            return res.status(401).json({ mensaje: "Credenciales incorrectas" })
        }

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
        res.status(500).json({ mensaje: "Error interno del servidor" })
    }
}
