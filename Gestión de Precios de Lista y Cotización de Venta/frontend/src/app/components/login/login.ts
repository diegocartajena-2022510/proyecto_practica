import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

  constructor(private auth: AuthService, private router: Router, private http: HttpClient) {};

  onLogin() {
    const credenciales = { correo: this.correo, pasword: this.pasword };

    this.auth.login(credenciales).subscribe({
      next: (res: any) => {
        console.log('Login Exisoto:', res);
        if (res && res.usuario) {
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
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
    this.isRegisterOpen = true;
  }

  onRegisterSubmit(){
    if(!this.nombre || !this.correo || !this.pasword || !this.telefono){
      this.errorMessage = 'Por favor, complete todos los campos';
      return;
    }else if(!this.isValidEmail(this.correo)){
      this.errorMessage = 'Por favor, ingrese un correo válido';
      return;
    }else if(this.pasword.length < 6){
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }else if(this.telefono.toString().length < 8 || this.telefono.toString().length > 8){
      this.errorMessage = 'este numero de telefono no es valido, intente de nuevo';
      return;
    }else{
      console.log('Registro Exitoso:', { nombre: this.nombre, correo: this.correo, pasword: this.pasword, telefono: this.telefono });
      this.submitRegister();
    }
  }

  closeRegister() {
    this.isRegisterOpen = false;
  }

  submitRegister() {
    const credenciales = { nombre: this.nombre, correo: this.correo, pasword: this.pasword, telefono: this.telefono };
    this.auth.register(credenciales).subscribe({
      next: (res: any) => {
        console.log('Registro Exitoso:', res);
        alert('Usuario registrado correctamente');
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err.error?.error || err.error?.mensaje || 'Ocurrió un error al registrar el usuario';
      }
    });
  }
  
  correoValidator(){
    if (!this.nombre || !this.correo || !this.pasword) {
      alert('Por favor, complete todos los campos');
      return;
    }

    if (!this.isValidEmail(this.correo)) {
      alert('Por favor, ingrese un correo válido');
      return;
    }

    const datosUsuario = {
      nombre: this.nombre,
      contrasena: this.pasword,
      correo: this.correo
    };
    this.http.post('http://localhost:3000/api/usuarios/registrar', datosUsuario).subscribe({
      next: (res: any) => {
        alert('¡Registro exitoso!');
        this.isRegisterOpen = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        if (err.error && err.error.mensaje) {
         alert(err.error.mensaje);
        } else {
          alert('Ocurrió un error al intentar registrar el usuario.');
        }
      }
    
    });
  }
}
