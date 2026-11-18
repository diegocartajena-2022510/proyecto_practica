import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class productosService {
    private apiUrl = 'http://localhost:3000/api/productos';
    private apiBaseUrl = 'http://localhost:3000/api'; 
    constructor(private http: HttpClient) {}

    getProductos(): Observable<any> {
        return this.http.get(this.apiUrl);
    }

    createProductos(producto: any): Observable<any> {
        return this.http.post(this.apiUrl, producto);
    }
    
    updateProductos(id: number, producto: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, producto);
    }

    deleteProductos(id: any): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    getCategorias(): Observable<any> {
        return this.http.get(`${this.apiBaseUrl}/categorias`);
    }

    listarProductosPVP(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiBaseUrl}/productos-pvp`); // <--- Apunta a /api/productos-pvp
    }   
}