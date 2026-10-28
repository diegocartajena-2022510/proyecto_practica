import { usuarios_login } from "../controller/usuariosController";
import {usuario_register} from "../controller/usuariosController";
import { Router } from "express";

const router= Router();


router.post('/login',usuarios_login);
router.post('/register', usuario_register);

export default router;