import { Response,Request } from "express";
import pool from "../config/db";

export const categoria_read = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await pool.query('CALL sp_categria_read()');
    res.json(rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export const categoria_create=async(req:Request,res:Response)=>{
    const{nombre}= req.body;
    try{
        await pool.query('CALL sp_categoria_create(?)', [nombre]);
        res.status(201).json({mensaje: "categoria agregada"});
    }catch(error:any){
        res.status(500).json({error: error.menssage});
    }
}

export const categoria_update=async (req:Request,res:Response)=>{
    const {id}= req.params;
    const {nombre}=req.body;
    try{
        await pool.query('CALL sp_categoria_update(?,?)',[id,nombre]);
        res.json({mensaje: "categoria editado correctamente"})
    }catch(error: any){
        res.status(500).json({error: error.message});
    }
}

export const categoria_delete= async(req:Request,res:Response)=>{
    const {id}= req.params;
    try{
        await pool.query('CALL sp_categoria_delete(?)',[id]);
        res.json({mensaje: 'producto eliminado correctaente'});
    }catch(error:any){
        res.status(500).json({error: error.message});
    }
}