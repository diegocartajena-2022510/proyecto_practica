import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  correo: string = '';
  pasword: string = '';
  nombre: string = '';
  telefono: number | null = null;
  errorMessage: string = '';
  isRegisterOpen = false;
  isLoading = false;

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    this.errorMessage = '';

    const correoLimpio = (this.correo || '').trim();
    const passwordLimpio = (this.pasword || '').trim();

    if (!correoLimpio || !passwordLimpio) {
      this.errorMessage = 'Complete todos los campos';
      return;
    }

    if (!this.isValidEmail(correoLimpio)) {
      this.errorMessage = 'Ingrese un correo válido';
      return;
    }

    this.isLoading = true;
    const credenciales = { correo: correoLimpio, pasword: passwordLimpio };

    this.auth.login(credenciales).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        let datosAguardar = res?.usuario || res;

        if (Array.isArray(datosAguardar)) {
          datosAguardar = datosAguardar[0];
        }

        if (!datosAguardar || (typeof datosAguardar === 'object' && Object.keys(datosAguardar).length === 0)) {
          this.errorMessage = 'Credenciales inválidas';
          return;
        }

        localStorage.setItem('usuario', JSON.stringify(datosAguardar));
        this.router.navigate(['/principal']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.errorMessage = err.error?.error || err.error?.mensaje || 'Correo o contraseña incorrectos';
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

    const nombreLimpio = (this.nombre || '').trim();
    const correoLimpio = (this.correo || '').trim();
    const passwordLimpio = (this.pasword || '').trim();
    const telStr = this.telefono !== null && this.telefono !== undefined ? String(this.telefono).trim() : '';

    if (!nombreLimpio || !correoLimpio || !passwordLimpio || !telStr) {
      this.errorMessage = 'Por favor, complete todos los campos';
      return;
    }

    if (!this.isValidEmail(correoLimpio)) {
      this.errorMessage = 'Por favor, ingrese un correo válido';
      return;
    }

    if (passwordLimpio.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (!/^\d{8}$/.test(telStr)) {
      this.errorMessage = 'Este número de teléfono no es válido, intente de nuevo';
      return;
    }

    this.submitRegister(nombreLimpio, correoLimpio, passwordLimpio, Number(telStr));
  }

  closeRegister() {
    this.isRegisterOpen = false;
    this.errorMessage = '';
  }

  submitRegister(nombre: string, correo: string, pasword: string, telefono: number) {
    const credenciales = { nombre, correo, pasword, telefono };

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