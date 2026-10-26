import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import proveedoresRouter from './routes/proveedoreRoutes'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api',proveedoresRouter);


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});