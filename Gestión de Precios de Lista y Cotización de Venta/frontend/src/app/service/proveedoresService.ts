import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  listarProveedores(): Observable<any> {
    return this.http.get(`${this.apiUrl}/proveedores`);
  }

  crearProveedor(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/proveedores`, data);
  }

  actualizarProveedor(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/proveedores/${id}`, data);
  }

  eliminarProveedor(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/proveedores/${id}`);
  }

  listarReglasMargen(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reglas_margen`);
  }
}