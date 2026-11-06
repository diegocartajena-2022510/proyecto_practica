import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth';
import { Router } from '@angular/router';
import { productosService } from '../../service/productosService';

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
  productoSeleccionado: any = null;  
  isModalOpen = false;

  totalActivos: number = 0;
  totalRevision: number = 0;
  totalSinStock: number = 0;

  // NUEVO: Carrito / Ítems agregados a la cotización por el comprador
  itemsCotizacion: { producto: any; cantidad: number }[] = [];
  monedaSeleccionada: string = 'MXN';
  notasAdicionales: string = '';
  datosUsuario: any = { nombre: '', correo: '' };

  constructor(
    private auth: AuthService, 
    private router: Router, 
    private productosService: productosService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.obtenerProductos(); 
      const localData = localStorage.getItem('usuario');
      if (localData) {
        this.datosUsuario = JSON.parse(localData);
      }
    } 
  }

  calcularResumen() {
    this.totalActivos = this.listaProductos.filter(p => (p.stock ?? 1) > 0).length;
    this.totalRevision = this.listaProductos.filter(producto => producto.estado === 'revisión').length;
    this.totalSinStock = this.listaProductos.filter(p => (p.stock ?? 1) <= 0).length;
  }

  obtenerProductos() {
    this.productosService.getProductos().subscribe({
      next: (res: any) => {
        this.listaProductos = res;
        this.productosFiltrados = res;
        this.calcularResumen();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
      }
    });
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

  // NUEVO: Funciones del carrito de cotización
  agregarAlCarrito(producto: any, event?: Event) {
    event?.stopPropagation(); // Evita que se abra el modal al dar clic en el botón de agregar
    const itemExistente = this.itemsCotizacion.find(item => item.producto.id_producto === producto.id_producto || item.producto.modelo === producto.modelo);
    if (itemExistente) {
      itemExistente.cantidad++;
    } else {
      this.itemsCotizacion.push({ producto, cantidad: 1 });
    }
  }

  removerItem(index: number) {
    this.itemsCotizacion.splice(index, 1);
  }

  get subtotal(): number {
    return this.itemsCotizacion.reduce((acc, item) => {
      const precio = item.producto.precio_lista ?? item.producto.precio ?? 0;
      return acc + (precio * item.cantidad);
    }, 0);
  }

  get iva(): number {
    return this.subtotal * 0.16;
  }

  get total(): number {
    return this.subtotal + this.iva;
  }

  enviarCotizacion() {
    if (this.itemsCotizacion.length === 0) {
      alert('Tu lista de cotización está vacía. Selecciona al menos un servicio.');
      return;
    }

    const propuestaFinal = {
      cliente: this.datosUsuario.nombre,
      correo: this.datosUsuario.correo,
      moneda: this.monedaSeleccionada,
      notas: this.notasAdicionales,
      items: this.itemsCotizacion,
      total: this.total,
      fecha: new Date()
    };

    console.log('Enviando propuesta de cotización:', propuestaFinal);
    alert('¡Solicitud de cotización enviada con éxito!');
    this.itemsCotizacion = [];
  }

  comprarPorProducto(producto: any) {
    // Si prefiere agregarlo directamente al carrito desde el modal
    this.agregarAlCarrito(producto);
    this.cerrarModal();
  } 

  onPerfil() { this.router.navigate(['/perfil']); }
  onCatalogo() { this.router.navigate(['/catalogo']); }
  regresarMenu() { this.router.navigate(['/principal']); }
  cerrarSesion() { this.router.navigate(['/login']); }
  onCotizar() { this.router.navigate(['/cotizar']); }
  onSobreNosotros() { this.router.navigate(['/sobre-nosotros']); }

  onBuscarpoducto(event: any) {
    const texto = event.target.value.trim().toLowerCase();

    if (texto === '') {
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