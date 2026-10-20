import db from "../config/db.js";

const validarProducto = (body) => {
    const nombre = typeof body?.nombre === "string" ? body.nombre.trim() : ""
    const descripcion = typeof body?.descripcion === "string" ? body.descripcion.trim() : ""
    const precioVacio = body?.precio === undefined || body?.precio === null || String(body.precio).trim() === ""
    const stockVacio = body?.stock === undefined || body?.stock === null || String(body.stock).trim() === ""
    const precio = Number(body?.precio)
    const stock = Number(body?.stock)

    if (!nombre || precioVacio || stockVacio || !Number.isFinite(precio) || precio < 0 || !Number.isInteger(stock) || stock < 0) {
        return { error: "Ingresá un nombre, un precio válido y un stock entero no negativo" }
    }

    return { producto: { nombre, descripcion, precio, stock } }
}

export const obtenerProductosAdmin = async (_req, res) => {
    try {
        const [productos] = await db.query("SELECT producto_id AS id, producto_id, nombre, descripcion, precio, stock FROM productos ORDER BY producto_id DESC")
        return res.json(productos)
    } catch (error) {
        console.error("Error al listar productos del panel:", error)
        return res.status(500).json({ mensaje: "No se pudieron cargar los productos" })
    }
}

export const publicarProducto = async (req, res) => {
    const validacion = validarProducto(req.body)
    if (validacion.error) return res.status(400).json({ mensaje: validacion.error })

    try {
        const { nombre, descripcion, precio, stock } = validacion.producto
        const [result] = await db.execute(
            "INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)",
            [nombre, descripcion, precio, stock]
        )
        return res.status(201).json({
            mensaje: "Producto creado",
            producto: { id: result.insertId, nombre, descripcion, precio, stock },
        })
    } catch (error) {
        console.error("Error al crear el producto:", error)
        return res.status(500).json({ mensaje: "No se pudo crear el producto" })
    }
}

export const actualizarProducto = async (req, res) => {
    const id = Number(req.params.id)
    const validacion = validarProducto(req.body)
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ mensaje: "ID de producto inválido" })
    if (validacion.error) return res.status(400).json({ mensaje: validacion.error })

    try {
        const { nombre, descripcion, precio, stock } = validacion.producto
        const [result] = await db.execute(
            "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE producto_id = ?",
            [nombre, descripcion, precio, stock, id]
        )
        if (result.affectedRows === 0) {
            const [productos] = await db.execute("SELECT producto_id FROM productos WHERE producto_id = ? LIMIT 1", [id])
            if (productos.length === 0) return res.status(404).json({ mensaje: "Producto no encontrado" })
        }
        return res.json({ mensaje: "Producto actualizado", producto: { id, nombre, descripcion, precio, stock } })
    } catch (error) {
        console.error("Error al actualizar el producto:", error)
        return res.status(500).json({ mensaje: "No se pudo actualizar el producto" })
    }
}

export const eliminarProducto = async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ mensaje: "ID de producto inválido" })

    try {
        const [result] = await db.execute("DELETE FROM productos WHERE producto_id = ?", [id])
        if (result.affectedRows === 0) return res.status(404).json({ mensaje: "Producto no encontrado" })
        return res.json({ mensaje: "Producto eliminado" })
    } catch (error) {
        console.error("Error al eliminar el producto:", error)
        return res.status(500).json({ mensaje: "No se pudo eliminar el producto" })
    }
}
