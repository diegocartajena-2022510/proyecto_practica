import { Router } from "express";
import { marca_create, marca_delete, marca_read, marca_update } from "../controller/marcaController";

const router=Router();

router.get("/marcas",marca_read);
router.post('/marcas',marca_create);
router.put('/marcas/:id',marca_delete);
router.delete('/marcas/:id',marca_update);
 
export default router;