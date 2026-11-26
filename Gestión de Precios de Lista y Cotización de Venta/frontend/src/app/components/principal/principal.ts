import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-principal',
  styleUrl: './principal.css',
  templateUrl: './principal.html',
})
export class Principal implements OnInit {
  datosUsuario: any = { nombre: '', correo: '', rol: 'usuario' };
  menuEntidadesAbierto = false;

  entidadesAdmin = [
    { key: 'categoria', label: 'Categorías' },
    { key: 'marcas', label: 'Marcas' },
    { key: 'productos', label: 'Productos' },
    { key: 'proveedores', label: 'Proveedores' },
    { key: 'reglas_margen', label: 'Reglas de margen' },
    { key: 'tipo_cambio', label: 'Tipo de cambio' },
    { key: 'usuario', label: 'Usuarios' }
  ];

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

  @HostListener('document:click')
  cerrarMenuAlClickFuera() {
    this.menuEntidadesAbierto = false;
  }

  onCatalogo() {
    this.menuEntidadesAbierto = false;
    if (this.datosUsuario?.rol === 'admin') {
      this.router.navigate(['/catalogo-admin']);
    } else {
      this.router.navigate(['/catalogo']);
    }
  }

  toggleMenuEntidades(event?: Event) {
    event?.stopPropagation();
    this.menuEntidadesAbierto = !this.menuEntidadesAbierto;
  }

  irAEntidad(entidadKey: string) {
    this.menuEntidadesAbierto = false;
    this.router.navigate(['/admin-entidad', entidadKey]);
  }

  regresarMenu() {
    this.menuEntidadesAbierto = false;
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

  onPerfil() {
    this.router.navigate(['/perfil']);
  }

  OnSobreNosotros() {
    this.router.navigate(['/sobre-nosotros']);
  }

  onGestionProveedores() {
    this.router.navigate(['/proveedores']);
  }

  onProveedores() {
    this.router.navigate(['/proveedores']);
  }

  onConfigurarPrecios() {
    this.router.navigate(['/admin-entidad', 'reglas_margen']);
  }

}