import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-principal',
  styleUrl: './principal.css',
  templateUrl: './principal.html',
})
export class Principal {
  
  datosUsuario: any = { nombre: '', correo: '', rol: 'usuario' };
  menuEntidadesAbierto=false;

  entidadesAdmin=[{key:'categorias', label:'Categorias'},
                  {key:'marcas', label:'Marcas'},
                  {key:'productos', label:'productos'},
                  {key:'proveedores', label:'Proveedores'},
                  {key:'reglas_margen', label:'Reglas de margen'},
                  {key:'usuario', label:'usuarios'}
                ]

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

  onCatalogo(){
    if (this.datosUsuario?.rol === 'admin') {
      this.router.navigate(['/catalogo-admin']);
    } else {
      this.router.navigate(['/catalogo']);
    }
  }
  toggleMenuEntidades(event?:Event){
    event?.stopImmediatePropagation();
    this.menuEntidadesAbierto= !this.menuEntidadesAbierto;
  }
  irAEntidad(entidadKey:string){
    this.menuEntidadesAbierto=false;
    this.router.navigate(['/admin-entidad',entidadKey])
  }

  regresarMenu(){
    this.router.navigate(['/principal']);
  }

  cerrarSesion(){
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  onCotizar(){
    this.router.navigate(['/cotizar']);
  }

  onPerfil(){
    this.router.navigate(['/perfil']);
  }

  OnSobreNosotros(){
    this.router.navigate(['/sobre-nosotros']);
  }

  onGestionProveedores(){

    alert('Módulo de Proveedores (Próximamente)');
  }
  onProveedores(){
    this.router.navigate(['/proveedores'])
  }

  onConfigurarPrecios(){
    alert('Motor de Reglas de Márgenes activo.');
  }
}