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
    tasa: '85%',
    rol: ''
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
        try {
          const usuarioParsed = JSON.parse(localData);
          this.datosUsuario = { ...this.datosUsuario, ...usuarioParsed };
        } catch (error) {
          console.error('Error al parsear los datos del usuario:', error);
          this.router.navigate(['/login']);
        }
      } else {
        console.warn('No se encontró una sesión activa. Redirigiendo...');
        this.router.navigate(['/login']);
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
    if (this.datosUsuario?.rol === 'admin') {
      this.router.navigate(['/catalogo-admin']);
    } else {
      this.router.navigate(['/catalogo']); // La vista para clientes normales
    }
  }

  regresarMenu() {
    this.router.navigate(['/principal']);
  }
  onProveedores(){
    this.router.navigate(['/proveedores']);
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
  onGestionProveedores() {
    alert('Módulo de Proveedores (Próximamente)');
  }

  onConfigurarPrecios() {
    alert('Motor de Reglas de Márgenes activo.');
  }
}