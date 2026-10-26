import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import proveedoresRouter from './routes/proveedoreRoutes';
import categoriaRouter from "./routes/categoriaRoutes"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api',proveedoresRouter,categoriaRouter);



app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});