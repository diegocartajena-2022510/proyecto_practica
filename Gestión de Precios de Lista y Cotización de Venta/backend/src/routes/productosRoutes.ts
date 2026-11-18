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
      WHERE p.activo = '1' OR p.activo = 1 OR p.activo IS TRUE
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

export default router;