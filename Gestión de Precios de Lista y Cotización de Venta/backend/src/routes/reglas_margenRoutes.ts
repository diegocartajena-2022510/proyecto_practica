import { Router } from "express";
import { reglas_margen_create,
        reglas_margen_delete,
        reglas_margen_update,
        reglas_margen_read
 } from "../controller/reglas_margenController";

const router=Router();
router.get("/reglas_margen",reglas_margen_read);
router.post('/reglas_margen',reglas_margen_create);
router.put('/reglas_margen/:id',reglas_margen_update);
router.delete('/reglas_margen/:id',reglas_margen_delete);

export default router;