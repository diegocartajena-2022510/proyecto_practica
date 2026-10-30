import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import proveedoresRouter from './routes/proveedoreRoutes';
import categoriaRouter from "./routes/categoriaRoutes"
import marcasRouter from './routes/marcasRoutes';
import reglas_margenRouter from './routes/reglas_margenRoutes';
import productosRoutes from "./routes/productosRoutes";
import usuariosRouter from './routes/usuariosRouter'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api',proveedoresRouter,categoriaRouter,marcasRouter,reglas_margenRouter,productosRoutes,usuariosRouter);



app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

