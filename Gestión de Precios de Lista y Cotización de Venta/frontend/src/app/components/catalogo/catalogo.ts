import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
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

  totalActivos:number=0;
  totalRevision:number=0;
  totalSinStock:number=0;

  constructor(private auth: AuthService, 
              private router: Router , 
              private productosService: productosService,
             @Inject(PLATFORM_ID) private platformId: Object,
              private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if(isPlatformBrowser(this.platformId)){
      this.obtenerProductos(); 
    } 
  }
  calcularResumen(){
    this.totalActivos = this.listaProductos.filter(p=>(p.stock ?? 1)>0).length;
    this.totalRevision = this.listaProductos.filter(producto => producto.estado === 'revisión').length;
    this.totalSinStock= this.listaProductos.filter(p=>(p.stock ?? 1)<=0).length;
  }


  obtenerProductos() {
    this.productosService.getProductos().subscribe({
      next: (res: any) => {
        this.listaProductos = res;
        this.productosFiltrados=res;
        this.calcularResumen();
        this.cdr.detectChanges();
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
  onPerfil(){
    this.router.navigate(['/perfil']);
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
  onBuscarpoducto(event: any) {
    const texto=event.target.value.trim().toLowerCase();

    if(texto===''){
      this.filtrarPorCategoria(this.categoriaSeleccionada);
      return;
    }

    this.productosFiltrados = this.listaProductos.filter(producto => {
      const modelo = producto.modelo?.toLowerCase() || '';
      const descripcion = producto.descripcion?.toLowerCase() || '';
      const categoria = producto.categoria_nombre?.toLowerCase() || '';

      return modelo.includes(texto) || descripcion.includes(texto) || categoria.includes(texto);
    });
    this.cdr.detectChanges();
  
  }
}
