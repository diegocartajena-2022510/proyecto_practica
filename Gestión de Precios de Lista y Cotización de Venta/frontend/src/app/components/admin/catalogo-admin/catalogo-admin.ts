import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProveedoresService } from '../../../service/proveedoresService';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-catalogo-admin',
  templateUrl: './catalogo-admin.html',
  styleUrl: './catalogo-admin.css'
})
export class CatalogoAdmin implements OnInit {
  datosUsuario: any = { nombre: '', correo: '', rol: '' };
  
  listarProductos: any[] = [];
  listarCategorias: any[] = [];
  listarMarcas: any[] = [];
  totalActivos: number = 0;

  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  productoActual: any = {
    id_productos: null,
    modelo: '',
    descripcion: '',
    id_categoria: null,
    id_marca: null,
    precio_lista: 0,
    stock: 0,
    moneda: 'USD',
    activo: '1'
  };

  constructor(
    private router: Router,
    private pro: ProveedoresService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const localData = localStorage.getItem('usuario');
      if (localData) {
        this.datosUsuario = JSON.parse(localData);
      }
      this.cargarProductosAdmin();
      this.cargarCategorias();
    }
  }

  cargarProductosAdmin() {
    this.pro.listarProductosPVP().subscribe({
      next: (data: any) => {
        this.listarProductos = (data || []).map((p: any) => ({
          ...p,
          categoria_nombre: p.categoria || p.categoria_nombre || 'General',
          marca_nombre: p.marca || p.marca_nombre || 'Sin marca',
          precio_pvp: p.pvp_final ?? p.precio_pvp ?? 0
        }));
        this.totalActivos = this.listarProductos.filter(p => p.activo == '1' || p.activo === true).length;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar productos en admin:', err)
    });
  }

  cargarCategorias() {
    this.pro.listarCategorias().subscribe({
      next: (data) => {
        this.listarCategorias = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar categorías:', err)
    });
  }

  // --- MÉTODOS DEL MODAL (Crear / Editar / Eliminar) ---
  abrirModalNuevo() {
    this.modoEdicion = false;
    this.productoActual = {
      id_productos: null,
      modelo: '',
      descripcion: '',
      id_categoria: null,
      id_marca: 1,
      precio_lista: 0,
      stock: 0,
      moneda: 'USD',
      activo: '1'
    };
    this.mostrarModal = true;
  }

  editarProducto(prod: any) {
    this.modoEdicion = true;
    this.productoActual = {
      ...prod,
      id_productos: prod.id_productos || prod.id_producto || prod.id
    };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  guardarProducto() {
    // Aquí conecta con tu método de crear/actualizar producto en el servicio si ya lo tienes
    console.log('Producto a guardar:', this.productoActual);
    this.cerrarModal();
    this.cargarProductosAdmin();
  }

  eliminarProducto(prod: any) {
    const id = prod.id_productos || prod.id_producto || prod.id;
    if (!id) return;
    if (confirm(`¿Estás seguro de eliminar "${prod.modelo || ''}"?`)) {
      this.listarProductos = this.listarProductos.filter(p => (p.id_productos || p.id) !== id);
      this.cdr.detectChanges();
    }
  }
  abrirModalEditar(prod: any) {
    this.editarProducto(prod);
  }

  // --- NAVEGACIÓN ---
  regresarMenu() { this.router.navigate(['/principal']); }
  onCatalogo() { this.router.navigate(['/catalogo']); }
  onProveedores() { this.router.navigate(['/proveedores']); }
  onSobreNosotros() { this.router.navigate(['/sobre-nosotros']); }
  onPerfil() { this.router.navigate(['/perfil']); }
  cerrarSesion() { this.router.navigate(['/login']); }
}