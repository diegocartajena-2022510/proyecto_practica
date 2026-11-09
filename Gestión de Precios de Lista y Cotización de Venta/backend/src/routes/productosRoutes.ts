import { Router } from "express";
import pool from "../config/db";

const router = Router();

router.get("/productos", async (req, res) => {
  try {
    const query = `
      SELECT 
        p.*, 
        c.nombre AS categoria_nombre, 
        COALESCE(r.porcentaje_margen, '0') as porcentaje_margen
      FROM productos p
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN reglas_margen r ON (p.id_categoria = r.id_categoria OR p.id_marca = r.id_marca)
    `;
    
    const [rows]: any = await pool.query(query);

    const productosConPVP = rows.map((prod: any) => {
      const precioLista = parseFloat(prod.precio_lista ?? prod.precio ?? 0);
      const margen = parseFloat(prod.porcentaje_margen) || 0; 

      const precioConMargen = precioLista * (1 + (margen / 100));
      const pvpFinal = precioConMargen * 1.16;

      return {
        ...prod,
        precio_lista: precioLista,
        porcentaje_margen: margen,
        precio_pvp: Number(pvpFinal.toFixed(2))
      };
    });

    return res.status(200).json(productosConPVP);
  } catch (error) {
    console.error("Error al obtener los productos con PVP:", error);
    return res.status(500).json({ mensaje: "Error al obtener los productos" });
  }
});

export default router;