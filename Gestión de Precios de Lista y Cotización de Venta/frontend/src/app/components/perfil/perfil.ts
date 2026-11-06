import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../service/usuarioService';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-perfil',
  styleUrl: './perfil.css',
  templateUrl: './perfil.html',
})
export class Perfil implements OnInit {
  datosUsuario: any = {
    nombre: '',
    correo: '',
    telefono: '',
    fecha_creacion: '',
    cargo: 'Administrador de Ventas',
    cotizaciones: 24,
    ventas: 12,
    tasa: '85%'
  };

  mostrarModal = false;
  perfilEditado: any = {};

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const localData = localStorage.getItem('usuario');
      if (localData) {
        const usuarioParsed = JSON.parse(localData);
        this.datosUsuario = { ...this.datosUsuario, ...usuarioParsed };
      }
    }
  }

  abrirModalEditar() {
    this.perfilEditado = { ...this.datosUsuario };
    this.mostrarModal = true;
  }

  cerrarModalEditar() {
    this.mostrarModal = false;
    this.perfilEditado = {};
  }

  guardarPerfil() {
    this.datosUsuario = { ...this.datosUsuario, ...this.perfilEditado };

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('usuario', JSON.stringify(this.datosUsuario));
    }

    this.cerrarModalEditar();
  }

  onCatalogo() {
    this.router.navigate(['/catalogo']);
  }

  regresarMenu() {
    this.router.navigate(['/principal']);
  }

  cerrarSesion() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuario');
    }
    this.router.navigate(['/login']);
  }

  onCotizar() {
    this.router.navigate(['/cotizar']);
  }

  OnSobreNosotros() {
    this.router.navigate(['/sobre-nosotros']);
  }

  guardarCambios() {
    this.datosUsuario={...this.datosUsuario, ...this.perfilEditado};
    this.usuarioService.actualizarUsuario(this.datosUsuario).subscribe({
      next: (res: any) => {
        alert('¡Perfil actualizado con éxito!');

        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('usuario', JSON.stringify(this.datosUsuario));
        }
        this.cerrarModalEditar();
      },
      error: (err) => {
        console.error('Error al actualizar:', err);
        alert('Hubo un error al actualizar el perfil.');
      }
    });
  }
}