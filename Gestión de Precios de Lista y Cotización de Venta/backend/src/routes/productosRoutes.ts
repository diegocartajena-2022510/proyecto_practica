import { Router } from "express";
import { productos_create,
        productos_delete,
        productos_update,
        productos_read

 } from "../controller/productosController";



const router=Router();
router.get("/productos",productos_read);
router.post('/productos',productos_create);
router.put('/productos/:id',productos_update);
router.delete('/productos/:id',productos_delete);

export default router;