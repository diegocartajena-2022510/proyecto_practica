import { Router } from 'express';
import db from '../config/db';

const router = Router();

router.get('/reglas_margen', async (req, res) => {
  const query = `
    SELECT 
      rm.id_margen,
      rm.id_categoria,
      rm.id_marca,
      rm.porcentaje_margen,
      c.nombre AS categoria_nombre,
      m.nombre AS marca_nombre
    FROM reglas_margen rm
    LEFT JOIN categoria c ON rm.id_categoria = c.id_categoria
    LEFT JOIN marcas m ON rm.id_marca = m.id_marca
  `;

  try {
    const [results] = await db.query(query);
    res.json(results);
  } catch (err) {
    console.error('Error al listar reglas de margen:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.put('/reglas_margen/:id', async (req, res) => {
  const { id } = req.params;
  const { id_categoria, porcentaje_margen } = req.body;

  const query = 'UPDATE reglas_margen SET id_categoria = ?, porcentaje_margen = ? WHERE id_margen = ?';

  try {
    await db.query(query, [id_categoria, porcentaje_margen, id]);
    res.json({ message: 'Regla de margen actualizada correctamente' });
  } catch (err: any) {
    console.error('Error al actualizar regla de margen:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
