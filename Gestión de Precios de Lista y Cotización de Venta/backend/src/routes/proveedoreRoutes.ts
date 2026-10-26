import { Router } from "express";
import { proveedores_read,
        proveedores_create,
        proveedores_delete,
        proveedores_update
 } from "../controller/proveedoresController";

const router=Router();

router.get("/proveedores",proveedores_read);
router.post('/proveedores',proveedores_create);
router.put('/proveedores/:id',proveedores_update);
router.delete('/proveedores/:id',proveedores_delete);

export default router;