import { Request, Response } from 'express'
import pool from '../config/db'

export const reglas_margen_read = async (req: Request, res: Response) => {
    try {
        const [rows]: any = await pool.query('CALL sp_reglas_margen_read()');
        res.json(rows[0]);
    } catch (error: any) {
        res.status(500).json({ error: error.message })
    }
};

export const reglas_margen_create = async (req: Request, res: Response) => {
    const { id_categoria, id_marca, porcentaje_margen, fecha_actualizacion } = req.body;
    try {
        await pool.query('CALL sp_reglas_margen_create(?,?,?,?)', [id_categoria, id_marca, porcentaje_margen, fecha_actualizacion]);
        res.status(201).json({ mensaje: 'regla de margen creado correctamente' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export const reglas_margen_update = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { id_categoria, id_marca, porcentaje_margen, fecha_actualizacion } = req.body;
    try {
        await pool.query('CALL sp_reglas_margen_update(?,?,?,?,?)', [id, id_categoria, id_marca, porcentaje_margen, fecha_actualizacion]);
        res.json({ mensaje: 'regla de margen actualizado correctamente' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export const reglas_margen_delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('CALL sp_reglas_margen_delete(?)', [id]);
        res.json({ mensaje: 'regla de margen eliminado correctamente' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}