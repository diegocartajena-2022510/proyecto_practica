import { Router } from 'express';
import db from '../config/db';

const router = Router();

router.get('/productos-pvp', async (req, res) => {
  try {
    const [tasaRows]: any = await db.query(
      'SELECT tasa FROM tipo_cambio ORDER BY id_tipo_cambio DESC LIMIT 1'
    );
    const tasaCambio = tasaRows.length > 0 ? parseFloat(tasaRows[0].tasa) : 1.0;

    const query = `
      SELECT 
        p.id_productos,
        p.modelo,
        p.descripcion,
        p.precio_lista,
        p.moneda,
        p.stock,
        p.activo,
        c.id_categoria,
        c.nombre AS categoria,
        m.id_marca,
        m.nombre AS marca,
        COALESCE(rm.porcentaje_margen, 20) AS porcentaje_margen
      FROM productos p
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN marcas m ON p.id_marca = m.id_marca
      LEFT JOIN reglas_margen rm 
        ON p.id_categoria = rm.id_categoria 
        AND (rm.id_marca = p.id_marca OR rm.id_marca IS NULL)
      WHERE (
        LOWER(TRIM(COALESCE(p.activo, ''))) IN ('1', 'true', 'activo')
        OR p.activo = 1
        OR p.activo IS TRUE
      )
    `;

    const [productos]: any = await db.query(query);

    const IVA = 0.12;

    const catalogoCalculado = productos.map((prod: any) => {
      const precioUsd = parseFloat(prod.precio_lista) || 0;
      const margen = parseFloat(prod.porcentaje_margen) || 0;

      const costoLocal = prod.moneda === 'USD' ? precioUsd * tasaCambio : precioUsd;
      const precioVentaNeto = costoLocal * (1 + margen / 100);
      const pvpFinal = precioVentaNeto * (1 + IVA);

      return {
        ...prod,
        tasa_aplicada: tasaCambio,
        costo_local: Number(costoLocal.toFixed(2)),
        precio_neto: Number(precioVentaNeto.toFixed(2)),
        pvp_final: Number(pvpFinal.toFixed(2))
      };
    });

    res.json(catalogoCalculado);
  } catch (err: any) {
    console.error('Error en motor de precios:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/productos', async (req, res) => {
  try {
    const {
      modelo,
      descripcion = '',
      id_categoria,
      id_marca = 1,
      precio_lista,
      moneda = 'USD',
      stock = 0,
      activo = '1'
    } = req.body;

    if (!modelo || precio_lista === undefined || precio_lista === null || !id_categoria) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios (modelo, precio_lista, id_categoria)'
      });
    }

    const [result]: any = await db.query(
      `INSERT INTO productos (modelo, descripcion, id_categoria, id_marca, precio_lista, moneda, stock, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        modelo,
        descripcion,
        Number(id_categoria),
        Number(id_marca || 1),
        Number(precio_lista),
        moneda || 'USD',
        Number(stock || 0),
        activo ?? '1'
      ]
    );

    res.status(201).json({
      message: 'Producto creado correctamente',
      id_productos: result.insertId
    });
  } catch (err: any) {
    console.error('Error al crear producto:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      modelo,
      descripcion = '',
      id_categoria,
      id_marca = 1,
      precio_lista,
      moneda = 'USD',
      stock = 0,
      activo = '1'
    } = req.body;

    const [result]: any = await db.query(
      `UPDATE productos
       SET modelo = ?,
           descripcion = ?,
           id_categoria = ?,
           id_marca = ?,
           precio_lista = ?,
           moneda = ?,
           stock = ?,
           activo = ?
       WHERE id_productos = ?`,
      [
        modelo,
        descripcion,
        Number(id_categoria),
        Number(id_marca || 1),
        Number(precio_lista),
        moneda || 'USD',
        Number(stock || 0),
        activo ?? '1',
        Number(id)
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto actualizado correctamente' });
  } catch (err: any) {
    console.error('Error al actualizar producto:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result]: any = await db.query(
      'DELETE FROM productos WHERE id_productos = ?',
      [Number(id)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err: any) {
    console.error('Error al eliminar producto:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;