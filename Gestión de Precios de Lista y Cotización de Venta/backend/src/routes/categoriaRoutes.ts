import { Router } from 'express';
import db from '../config/db';
import {
  categoria_create,
  categoria_read,
  categoria_delete,
  categoria_update
} from '../controller/categoriasController';

const router = Router();

router.get('/categorias', async (req, res) => {
  const query = 'SELECT * FROM categoria';

  try {
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    console.error('Error al listar categorías:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.get('/categoria', categoria_read);
router.post('/categoria', categoria_create);
router.put('/categoria/:id', categoria_update);
router.delete('/categoria/:id', categoria_delete);

router.post('/categorias', categoria_create);
router.put('/categorias/:id', categoria_update);
router.delete('/categorias/:id', categoria_delete);

export default router;