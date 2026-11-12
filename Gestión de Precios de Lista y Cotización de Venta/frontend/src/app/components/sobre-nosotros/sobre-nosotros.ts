import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-sobre-nosotros',
  styleUrl: './sobre-nosotros.css',
  templateUrl: './sobre-nosotros.html',
})
export class SobreNosotros {

  datosUsuario: any = { nombre: '', correo: '', rol: 'usuario' };

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const localData = localStorage.getItem('usuario');
      if (localData) {
        this.datosUsuario = JSON.parse(localData);
      }
    }
  }

  regresarMenu() {
    this.router.navigate(['/principal']);
  }

  onCatalogo() {
    if (this.datosUsuario?.rol === 'admin') {
      this.router.navigate(['/catalogo-admin']);
    } else {
      this.router.navigate(['/catalogo']); // La vista para clientes normales
    }
  }

  onCotizar() {
    this.router.navigate(['/cotizar']);
  }
  onProveedores(){
    this.router.navigate(['/proveedores'])
  }

  OnSobreNosotros() {
    this.router.navigate(['/sobre-nosotros']);
  }

  cerrarSesion() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuario');
    }
    this.router.navigate(['/login']);
  }

  onPerfil() {
    this.router.navigate(['/perfil']);
  }

  onGestionProveedores() {
    alert('Módulo de Proveedores (Próximamente)');
  }

  onConfigurarPrecios() {
    alert('Motor de Reglas de Márgenes activo.');
  }
}