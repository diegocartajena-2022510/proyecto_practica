import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth';
import { Router } from '@angular/router';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  correo: string = '';
  pasword: string = '';
  nombre: string = '';
  telefono: number = 0;
  errorMessage: string = '';
  isRegisterOpen = false;

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.errorMessage = '';
    const credenciales = { correo: this.correo, pasword: this.pasword };

    this.auth.login(credenciales).subscribe({
      next: (res: any) => {
        console.log('Login Exitoso:', res);

        // Si res.usuario es un array (ej: [ {id_usuario: 2, ...} ]), extraemos el índice [0]. 
        // Si es un objeto directo, lo usamos tal cual.
        let datosAguardar = res.usuario || res;
        
        if (Array.isArray(datosAguardar)) {
          datosAguardar = datosAguardar[0];
        }

        if (datosAguardar) {
          localStorage.setItem('usuario', JSON.stringify(datosAguardar));
        }

        this.router.navigate(['/principal']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err.error?.error || 'Ocurrió un error al iniciar sesión';
      }
    });
  }

  onRegister(event?: Event) {
    event?.preventDefault();
    this.errorMessage = '';
    this.isRegisterOpen = true;
  }

  onRegisterSubmit() {
    this.errorMessage = '';

    if (!this.nombre || !this.correo || !this.pasword || !this.telefono) {
      this.errorMessage = 'Por favor, complete todos los campos';
      return;
    } 
    if (!this.isValidEmail(this.correo)) {
      this.errorMessage = 'Por favor, ingrese un correo válido';
      return;
    } 
    if (this.pasword.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    } 
    if (this.telefono.toString().length < 8 || this.telefono.toString().length > 8) {
      this.errorMessage = 'Este número de teléfono no es válido, intente de nuevo';
      return;
    }

    this.submitRegister();
  }

  closeRegister() {
    this.isRegisterOpen = false;
    this.errorMessage = '';
  }

  submitRegister() {
    const credenciales = { 
      nombre: this.nombre, 
      correo: this.correo, 
      pasword: this.pasword, 
      telefono: this.telefono 
    };

    this.auth.register(credenciales).subscribe({
      next: (res: any) => {
        console.log('Registro Exitoso:', res);
        alert('¡Usuario registrado correctamente! Ya puedes iniciar sesión.');
        this.isRegisterOpen = false;
        this.errorMessage = '';
        this.pasword = '';
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err.error?.error || err.error?.mensaje || 'Ocurrió un error al registrar el usuario';
      }
    });
  }
}