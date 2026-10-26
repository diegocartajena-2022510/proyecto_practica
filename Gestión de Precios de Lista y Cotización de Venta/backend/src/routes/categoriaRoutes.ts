import { categoria_create,
        categoria_read,
        categoria_delete,
        categoria_update
 } from "../controller/categoriasController";
import { Router } from "express";

const router=Router();
 
router.get("/categoria",categoria_read);
router.post('/categoria',categoria_create);
router.put('/categoria/:id',categoria_update);
router.delete('/categoria/:id',categoria_delete);
 
export default router;