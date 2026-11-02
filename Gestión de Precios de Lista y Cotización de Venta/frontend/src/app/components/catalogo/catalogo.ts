import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth';
import { Router } from '@angular/router';
import {productosService} from '../../service/productosService';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-catalogo',
  styleUrl: './catalogo.css',
  templateUrl: './catalogo.html',
})
export class Catalogo {
  listaProductos: any[] = [];
  productosFiltrados: any[] = [];
  categoriaSeleccionada: string = 'Todos';
  productoSeleccionado:any=null;
  isModalOpen = false;

  constructor(private auth: AuthService, 
              private router: Router , 
              private productosService: productosService,
             @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.obtenerProductos();
  }

  obtenerProductos() {
    this.productosService.getProductos().subscribe({
      next: (res: any) => {
        this.listaProductos = res;
        this.productosFiltrados=res;
      },
      error: (err) => {
        console.error(err);
      }
    })
  }
  filtrarPorCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    if (categoria === 'Todos') {
      this.productosFiltrados = this.listaProductos;
    } else {
      this.productosFiltrados = this.listaProductos.filter(producto => producto.categoria_nombre === categoria);
    }
  }
  

  seleccionarProducto(producto: any) {
    this.productoSeleccionado = producto;
    this.isModalOpen = true;
  }
  
  cerrarModal() {
    this.isModalOpen = false;
    this.productoSeleccionado = null;
  }
  comprarPorProducto(producto: any) {
    this.router.navigate(['/cotizar'], { state: { producto } });
  } 

  onCatalogo(){
    this.router.navigate(['/catalogo']);
  }
  regresarMenu(){
    this.router.navigate(['/principal']);
  }

  cerrarSesion(){
    this.router.navigate(['/login']);
  }
  onCotizar(){
    this.router.navigate(['/cotizar']);
  }
  onSobreNosotros(){
    this.router.navigate(['/sobre-nosotros']);
  }

  onWlan(){
    this.router.navigate(['/wlan']);
  }
  onCctv(){
    this.router.navigate(['/cctv']);
  }
  onPtpPtpm(){
    this.router.navigate(['/ptp-ptmp']);
  }
  onControlAcceso(){
    this.router.navigate(['/control-acceso']);
  } 

}
