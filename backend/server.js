import app from "./app.js"
import dotenv from "dotenv"
dotenv.config()

const { PORT } = process.env

app.listen(PORT || 3000, () => {
    console.log(`Servidor ejecutandose en el puerto ${PORT}`)
})