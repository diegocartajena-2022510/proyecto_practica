import { Request,Response } from "express";
import pool from "../config/db";

export const proveedores_read = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('CALL sp_proveedores_read()');
    res.json(rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
export const proveedores_create=async (req:Request,res:Response)=>{
    const {nombre_proveedores,contacto_proveedores}=req.body;
    try{
        await pool.query('CALL sp_proveedores_create(?,?)',[nombre_proveedores,contacto_proveedores]);
        res.status(201).json({mensaje: "producto creado exitosamente"});

    }catch(error:any){
        res.status(500).json({ error: error.message });
    }
}
export const proveedores_update = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { nombre_proveedores, contacto_proveedores } = req.body;
  try {
    await pool.query('CALL sp_proveedores_update(?, ?, ?)', [id,nombre_proveedores,contacto_proveedores]);
    res.json({ mensaje: 'Producto actualizado exitosamente' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
export const proveedores_delete= async (req:Request, res:Response)=>{
    const{id}= req.params;
    try{
        await pool.query('CALL sp_proveedores_delete(?)',[id]);
        res.json({mensaje:'producto eliminado correctamente'});
    }catch(error:any){
        res.status(500).json({error: error.message})
    }
}