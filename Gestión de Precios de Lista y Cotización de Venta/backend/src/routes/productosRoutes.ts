import { Router } from "express";
import { productos_create,
        productos_delete,
        productos_update,
        productos_read

 } from "../controller/productosController";
import pool from "../config/db";



const router=Router();

router.get("/productos", async (req, res) => {

  try{
    const query = `
      SELECT 
        p.id_productos, 
        p.modelo, 
        p.descripcion, 
        p.precio_lista, 
        p.moneda, 
        p.activo,
        c.nombre AS categoria_nombre  
      FROM productos p
      INNER JOIN categoria c ON p.id_categoria = c.id_categoria
    `;
    const [rows]: any = await pool.query(query);
    return res.status(200).json(rows);
  }catch(error){
    console.error("Error al obtener los productos:", error);
    return res.status(500).json({ mensaje: "Error al obtener los productos" });
  }
});


router.get("/productos",productos_read);
router.post('/productos',productos_create);
router.put('/productos/:id',productos_update);
router.delete('/productos/:id',productos_delete);



export default router;