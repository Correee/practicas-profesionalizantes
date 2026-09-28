import db from "../config/db.js"

export const obtenerProductos = async (req, res) => {
    try {
        const [productos] = await db.query(
            'SELECT * FROM productos'
        )
        res.json(productos)
    } catch (error) {
        console.error(error)
        res.status(500).json({ mensaje: 'Error al obtener productos' })
    }
}