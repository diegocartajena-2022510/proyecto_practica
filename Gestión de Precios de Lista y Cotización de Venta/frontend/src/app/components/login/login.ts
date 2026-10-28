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
  errorMessage: string = '';
  isRegisterOpen = false;

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    const credenciales = { correo: this.correo, pasword: this.pasword };

    this.auth.login(credenciales).subscribe({
      next: (res: any) => {
        console.log('Login Exisoto:', res);
        alert('Bienvenido ' + res.usuario.nombre);

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
    this.isRegisterOpen = true;
  }

  closeRegister() {
    this.isRegisterOpen = false;
  }

  submitRegister() {
    this.closeRegister();
    console.log('Usuario registrado correctamente');
  }
}