import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URI = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  login(credenciales: { correo: string, pasword: string }): Observable<any> {
    return this.http.post(`${this.API_URI}/login`, credenciales);
  }
}