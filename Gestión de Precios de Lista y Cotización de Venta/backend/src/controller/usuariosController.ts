import { Response,Request } from "express";
import pool from "../config/db";

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const usuarios_login = async (req: Request, res: Response) => {
    const correo = String(req.body?.correo ?? '').trim();
    const pasword = String(req.body?.pasword ?? req.body?.password ?? '').trim();

    try {
        const [rows]: any = await pool.query('CALL sp_usuarios_login(?, ?)', [correo, pasword]);
        const usuarioEncontrado = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

        if (usuarioEncontrado) {
            return res.json({
                mensaje: 'Login exitoso',
                usuario: usuarioEncontrado
            });
        }

        return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}

export const usuario_register = async (req: Request, res: Response) => {
    const nombre = String(req.body?.nombre ?? '').trim();
    const correo = String(req.body?.correo ?? '').trim();
    const pasword = String(req.body?.pasword ?? req.body?.password ?? '').trim();
    const telefono = Number(req.body?.telefono ?? 0);

    if (!nombre || !correo || !pasword || !telefono) {
        return res.status(400).json({ error: 'Por favor, complete todos los campos' });
    }

    if (!isValidEmail(correo)) {
        return res.status(400).json({ error: 'Por favor, ingrese un correo válido' });
    }

    if (pasword.length < 6) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    try {
        const [existing]: any = await pool.query(
            'SELECT id_usuario FROM usuario WHERE LOWER(correo) = LOWER(?) LIMIT 1',
            [correo]
        );

        if (existing && existing.length > 0) {
            return res.status(409).json({
                error: 'El correo electrónico ya está registrado. Intenta con otro.'
            });
        }

        await pool.query('CALL sp_usuarios_create(?, ?, ?, ?)', [nombre, correo, pasword, telefono]);
        return res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
    } catch (error: any) {
        if (error?.errno === 1062 || error?.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'El correo electrónico ya está registrado. Intenta con otro.'
            });
        }

        return res.status(500).json({ error: error.message || 'No se pudo registrar el usuario' });
    }

}

export const usuarios_update= async(req:Request, res:Response)=>{
    console.log("backend recibiendo", req.body)
    const {id_usuario,nombre,correo,pasword,password,telefono}=req.body;
    let passwordfinal = String(pasword ?? password ?? '').trim();

    if(!passwordfinal){
        const [userRows]:any= await pool.query('SELECT pasword FROM usuario WHERE id_usuario = ?', [id_usuario]);
        if (userRows && userRows.length > 0) {
            passwordfinal = String(userRows[0].pasword ?? '').trim();
        }
    }
    try {
        await pool.query('CALL sp_usuarios_update(?,?,?,?,?)',[id_usuario,nombre,correo,passwordfinal,telefono]);
        res.json({mensaje:'Usuario actualizado correctamente'});
    } catch (error:any) {
        console.error("error", error)
        res.status(500).json({error:error.message});
    }
}