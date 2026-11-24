import { Router } from 'express';
import db from '../config/db';

const router = Router();

router.get('/tipo-cambio', async (req, res) => {
  const query = 'SELECT * FROM tipo_cambio ORDER BY id_tipo_cambio DESC LIMIT 1';
  try {
    const [results]: any = await db.query(query);
    res.json(results[0] || { tasa: 1.0000 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/tipo-cambio', async (req, res) => {
  const { tasa } = req.body;
  const query = 'INSERT INTO tipo_cambio (tasa) VALUES (?)';
  try {
    await db.query(query, [tasa]);
    res.json({ message: 'Tipo de cambio actualizado correctamente' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;