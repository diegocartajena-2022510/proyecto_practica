import { Response,Request } from "express";
import pool from "../config/db";

export const usuarios_login = async (req: Request, res: Response) => {
    const { correo, pasword } = req.body;
    try {
        const [rows]: any = await pool.query('CALL sp_usuarios_login(?, ?)', [correo, pasword]);
        
        
        const usuarioEncontrado = rows[0];

        if (usuarioEncontrado && usuarioEncontrado.length > 0) {
            res.json({ 
                mensaje: 'Login exitoso', 
                usuario: usuarioEncontrado[0] 
            });
        } else {
            res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export const usuario_register = async (req: Request, res: Response) => {
    const { nombre, correo, pasword } = req.body;
    try{
        await pool.query('CALL sp_usuarios_create(?, ?, ?)', [nombre, correo, pasword]);
        res.json({ mensaje: 'Usuario registrado exitosamente' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }


}