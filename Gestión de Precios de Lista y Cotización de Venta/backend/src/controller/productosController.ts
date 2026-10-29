import { Response,Request } from "express";
import pool from "../config/db";

export const productos_read=async(req:Request,res:Response)=>{
    try{
        const [rows]:any= await pool.query('CALL sp_productos_read()');
        res.json(rows[0]);
    }catch(error:any){
        res.status(500).json({error: error.message})
    }
}

export const productos_create= async(req:Request, res:Response)=>{
    const {id_marca,id_categoria,stock,modelo,descripcion,precio_lista,moneda,activo}=req.body;
    try{
        await pool.query('CALL sp_productos_create(?,?,?,?,?,?,?,?)',[id_marca,id_categoria,stock,modelo,descripcion,precio_lista,moneda,activo]);
        res.status(201).json({mensaje: "producto creado correctamente"});
    }catch(error: any){
        res.status(500).json({error:error.message});
    }
}

export const productos_update=async(req:Request,res:Response)=>{
    const{id}=req.params;
    const {id_marca,id_categoria,stock,modelo,descripcion,precio_lista,moneda,activo}=req.body;
    try{
        await pool.query('CALL sp_productos_update(?,?,?,?,?,?,?,?,?)',[id,id_marca,id_categoria,stock,modelo,descripcion,precio_lista,moneda,activo]);
        res.json({mensaje: "producto actualizado correctamente"});
    }catch(error:any){
        res.status(500).json({error: error.message});
    }
}

export const productos_delete=async(req:Request,res:Response)=>{
    const{id}=req.params;
    try{
        await pool.query('CALL sp_productos_delete(?)',[id]);
        res.json({mensaje:"producto eliminado correctamente"});
    }catch(error:any){
        res.status(500).json({error: error.message});
    }

    
}


