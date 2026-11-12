import { Component, Inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { productosService } from '../../../service/productosService';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-catalogo-admin',
  styleUrl: './catalogo-admin.css',
  templateUrl: './catalogo-admin.html',
})
export class CatalogoAdmin implements OnInit {
  datosUsuario: any = { nombre: '', correo: '', rol: '' };
  listarProductos: any[] = [];
  listarCategorias:any[]=[];

  mostrarModal = false;
  modoEdicion = false;
  // Sincronizado con los nombres exactos del formulario HTML: nombre y precio
  productoActual: any = { id_producto: null, nombre: '', descripcion: '', precio: 0, stock: 0, id_categoria:null};

  constructor(
    private router: Router,
    private prodService: productosService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private plataformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.plataformId)) {
      const localData = localStorage.getItem('usuario');
      if (localData) {
        this.datosUsuario = JSON.parse(localData);
      }
      this.cargarProductos();
      this.cargarCategoria();
    }
    
  }

  cargarProductos() {
    this.prodService.getProductos().subscribe({
      next: (data) => {
        this.listarProductos = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.log('Error al listar productos', err)
    });
  }

  cargarCategoria() {
    this.prodService.getCategorias().subscribe({
      next: (data) => {
        this.listarCategorias = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar categorías', err)
    });
  }

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.productoActual = { 
      id_producto: null, 
      nombre: '', 
      descripcion: '', 
      precio: 0, 
      stock: 0,
      id_marca: 1,
      id_categoria:1
    };
    this.mostrarModal = true;
  }

  abrirModalEditar(prod: any) {
    this.modoEdicion = true;
    this.productoActual = { 
      ...prod, 
      id_producto: prod.id_producto || prod.id_productos || prod.id,
      id_categoria:prod.id_categoria
    };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardarProducto() {
    if (this.modoEdicion) {
      const id = this.productoActual.id_producto || this.productoActual.id_productos || this.productoActual.id;
      
      this.prodService.updateProductos(id, this.productoActual).subscribe({
        next: () => {
          this.cargarProductos();
          this.cerrarModal();
        },
        error: (err) => console.error('Error al actualizar:', err)
      });
    } else {
      this.prodService.createProductos(this.productoActual).subscribe({
        next: () => {
          this.cargarProductos();
          this.cerrarModal();
        },
        error: (err) => console.error('Error al crear:', err)
      });
    }
  }

  eliminarProducto(prod: any) {
    console.log("Objeto producto recibido para eliminar:", prod); // Para depurar en consola
    
    // Buscamos con seguridad cualquier posible nombre de la propiedad del ID
    const id = prod.id_producto || prod.id_productos || prod.id || prod.id_item;

    if (!id) {
      alert("Error: No se pudo identificar el ID del producto.");
      console.error("Objeto sin ID válido:", prod);
      return;
    }

    if (confirm(`¿Estás seguro de eliminar el producto "${prod.nombre || prod.modelo || 'Sin nombre'}"?`)) {
      this.prodService.deleteProductos(id).subscribe({
        next: () => {
          this.listarProductos = this.listarProductos.filter(
            p => (p.id_producto || p.id_productos || p.id || p.id_item) !== id
          );
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }

  regresarMenu() { this.router.navigate(['/principal']); }
  OnSobreNosotros() { this.router.navigate(['/sobre-nosotros']); }
  onPerfil() { this.router.navigate(['/perfil']); }
  cerrarSesion() { this.router.navigate(['/login']); }
  onProveedores() { this.router.navigate(['/proveedores']); }
}