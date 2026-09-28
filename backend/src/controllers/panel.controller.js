import db from "../config/db.js";

export const publicarProducto = async (req, res) => {

    const { nombre, descripcion, precio, stock } = req.body

    if (!nombre || !descripcion || precio == null || stock == null) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO productos (nombre, descripcion, precio, stock)
            VALUES (?, ?, ?, ?)`,
            [nombre, descripcion ?? null, Number(precio), Number(stock)]
        );

        return res.status(201).json({
            message: "Producto creado",
            product: {
                id: result.insertId,
                nombre,
                descripcion: descripcion ?? null,
                precio: Number(precio),
                stock: Number(stock)
            }
        })
    } catch (error) {
        console.error("Error al crear el producto: ", error)
        return res.status(500).json({ message: "No se pudo crear el producto" })
    }
}