import {Response,Request} from 'express';
import pool from '../config/db';

export const marca_read=async (req:Request,res:Response)=>{
    try{
        const [rows]:any= await pool.query('CALL sp_marcas_read()');
        res.json(rows[0]);
    }catch(error:any){
        res.status(500).json({error: error.message});
    }
}
export const marca_create=async(req:Request,res:Response)=>{
    const {nombre}=req.body;
    try{
        await pool.query('CALL sp_marcas_create(?)',[nombre]);
        res.status(201).json({mensaje: 'marca creada correctamente'});
    }catch(error:any){
        res.status(500).json({error: error.message});
    }
}
export const marca_update=async(req:Request,res:Response)=>{
    const{id}=req.params;
    const{nombre}=req.body;
    try{
        await pool.query('CALL sp_marcas_update(?,?)',[id,nombre]);
        res.status(201).json({mensaje: "marca actualizada correctamente"});
    }catch(error:any){
        res.status(500).json({error:error.message});
    }
}

export const marca_delete=async(req:Request,res:Response)=>{
    const{id}=req.params;
    try{
        await pool.query('CALL sp_marcas_delete(?)',[id]);
        res.status(201).json({mensaje: 'marca eliminada correctamente'})
    }catch(error:any){
        res.status(500).json({error:error.message});
    }
}


