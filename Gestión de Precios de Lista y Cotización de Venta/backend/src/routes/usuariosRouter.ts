import { usuarios_login } from "../controller/usuariosController";
import {usuario_register} from "../controller/usuariosController";
import { Router } from "express";
import db from "../config/db";

const router= Router();

router.post('/login',usuarios_login);
router.post('/register', usuario_register);

router.post('/usuarios/registrar', async (req, res) => {
  const nombre = String(req.body?.nombre ?? '').trim();
  const contrasena = String(req.body?.contrasena ?? '').trim();
  const edad = req.body?.edad;
  const correo = String(req.body?.correo ?? '').trim();

  if (!nombre || !contrasena || !correo) {
    return res.status(400).json({ mensaje: 'Por favor, complete todos los campos' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    return res.status(400).json({ mensaje: 'Por favor, ingrese un correo válido' });
  }

  try {
    const [existingRows]: any = await db.query(
      'SELECT id_usuario FROM usuario WHERE LOWER(correo) = LOWER(?) LIMIT 1',
      [correo]
    );

    if (existingRows && existingRows.length > 0) {
      return res.status(409).json({
        mensaje: 'El correo electrónico ya está registrado. Intenta con otro.'
      });
    }

    await db.query('CALL sp_registrar_usuario_conductor(?, ?, ?, ?)', [
      nombre,
      contrasena,
      edad,
      correo
    ]);

    return res.status(201).json({ mensaje: 'Usuario registrado con éxito' });

  } catch (error: unknown) {
    const mysqlError = error as { errno?: number; code?: string };
    if (mysqlError.errno === 1062 || mysqlError.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        mensaje: 'El correo electrónico ya está registrado. Intenta con otro.'
      });
    }

    return res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

export default router;
