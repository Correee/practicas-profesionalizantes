import db from "../config/db.js"

export const obtenerProductos = async (req, res) => {
    try {
        const [productos] = await db.query(
            'SELECT producto_id AS id, producto_id, nombre, descripcion, precio, stock FROM productos ORDER BY producto_id DESC'
        )
        res.json(productos)
    } catch (error) {
        console.error(error)
        res.status(500).json({ mensaje: 'Error al obtener productos' })
    }
}
