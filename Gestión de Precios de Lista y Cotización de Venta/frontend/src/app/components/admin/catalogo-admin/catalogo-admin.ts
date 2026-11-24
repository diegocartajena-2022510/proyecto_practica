import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProveedoresService } from '../../../service/proveedoresService';
import { productosService } from '../../../service/productosService';

function TextoVacio(value: unknown): boolean {
  return typeof value !== 'string' || value.trim().length === 0;
}

function soloNumeros(value: unknown): boolean {
  const limpio = String(value ?? '').trim();
  return limpio.length > 0 && /^\d+(\.\d+)?$/.test(limpio);
}

function parseValidNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const normalized =
    typeof value === 'string' ? value.trim().replace(/,/g, '') : value;
  if (normalized === '') return null;
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

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
  guardando: boolean = false;
  errorMessage: string = '';
  productoActual: any = this.getProductoVacio();

  constructor(
    private router: Router,
    private pro: ProveedoresService,
    private cdr: ChangeDetectorRef,
    private productoSer: productosService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private getProductoVacio() {
    return {
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
  }

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
        this.totalActivos = this.listarProductos.filter(
          p => p.activo == '1' || p.activo === true || String(p.activo).toLowerCase() === 'activo'
        ).length;
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

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.errorMessage = '';
    this.guardando = false;
    this.productoActual = this.getProductoVacio();
    this.mostrarModal = true;
  }

  editarProducto(prod: any) {
    this.modoEdicion = true;
    this.errorMessage = '';
    this.guardando = false;
    this.productoActual = {
      ...prod,
      id_productos: prod.id_productos || prod.id_producto || prod.id,
      id_categoria: prod.id_categoria ?? null,
      id_marca: prod.id_marca ?? 1,
      precio_lista: prod.precio_lista ?? 0,
      stock: prod.stock ?? 0,
      moneda: prod.moneda || 'USD',
      activo: prod.activo ?? '1'
    };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.errorMessage = '';
    this.guardando = false;
  }

  guardarProducto() {
    if (this.guardando) return;
    this.errorMessage = '';

    const modeloLimpio = String(this.productoActual?.modelo ?? '').trim();
    const descripcionLimpia = String(this.productoActual?.descripcion ?? '').trim();

    if (TextoVacio(modeloLimpio)) {
      this.errorMessage = 'El nombre o modelo del producto es obligatorio.';
      return;
    }

    if (soloNumeros(modeloLimpio)) {
      this.errorMessage = 'El nombre o modelo no puede ser únicamente un número.';
      return;
    }

    if (!TextoVacio(descripcionLimpia) && soloNumeros(descripcionLimpia)) {
      this.errorMessage = 'La descripción no puede ser únicamente un número.';
      return;
    }

    if (
      this.productoActual?.id_categoria === null ||
      this.productoActual?.id_categoria === undefined ||
      String(this.productoActual.id_categoria).trim() === ''
    ) {
      this.errorMessage = 'Debes seleccionar una categoría.';
      return;
    }

    const precioValido = parseValidNumber(this.productoActual?.precio_lista);
    if (precioValido === null || precioValido <= 0) {
      this.errorMessage = 'Ingresa un precio de lista válido mayor que 0.';
      return;
    }

    const stockValido = parseValidNumber(this.productoActual?.stock);
    if (stockValido === null || !Number.isInteger(stockValido) || stockValido < 0) {
      this.errorMessage = 'El stock debe ser un número entero de 0 o más.';
      return;
    }

    const monedaLimpia = String(this.productoActual?.moneda ?? '').trim();
    if (!['USD', 'Q', 'GTQ'].includes(monedaLimpia)) {
      this.errorMessage = 'Selecciona una moneda válida.';
      return;
    }

    const payload = {
      ...this.productoActual,
      modelo: modeloLimpio,
      descripcion: descripcionLimpia,
      id_categoria: Number(this.productoActual.id_categoria),
      id_marca: Number(this.productoActual.id_marca || 1),
      precio_lista: precioValido,
      stock: stockValido,
      moneda: monedaLimpia,
      activo: this.productoActual.activo ?? '1'
    };

    this.guardando = true;

    const peticion$ = this.modoEdicion && payload.id_productos
      ? this.productoSer.updateProductos(payload.id_productos, payload)
      : this.productoSer.createProductos(payload);

    peticion$.subscribe({
      next: () => {
        this.guardando = false;
        this.cerrarModal();
        this.productoActual = this.getProductoVacio();
        this.cargarProductosAdmin();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.guardando = false;
        console.error('Error al guardar producto:', err);
        this.errorMessage = err.error?.error || 'Ocurrió un error al guardar el producto.';
        this.cdr.detectChanges();
      }
    });
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

  regresarMenu() { this.router.navigate(['/principal']); }
  onCatalogo() { this.router.navigate(['/catalogo']); }
  onProveedores() { this.router.navigate(['/proveedores']); }
  onSobreNosotros() { this.router.navigate(['/sobre-nosotros']); }
  onPerfil() { this.router.navigate(['/perfil']); }
  cerrarSesion() { this.router.navigate(['/login']); }

}