import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth';
import { Router } from '@angular/router';
import { productosService } from '../../service/productosService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  errorMessage: string = '';
  generandoPDF: boolean = false;

  totalActivos: number = 0;
  totalRevision: number = 0;
  totalSinStock: number = 0;

  itemsCotizacion: { producto: any; cantidad: number }[] = [];
  monedaSeleccionada: string = 'Q';
  notasAdicionales: string = '';
  datosUsuario: any = { nombre: '', correo: '' };

  fechaActual: Date = new Date();

  constructor(
    private auth: AuthService,
    private router: Router,
    private productosService: productosService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const localData = localStorage.getItem('usuario');
      if (localData) {
        this.datosUsuario = JSON.parse(localData);
      }
      this.cargarProductosCatalogo();
    }
  }

  cargarProductosCatalogo() {
    this.errorMessage = '';
    this.productosService.listarProductosPVP().subscribe({
      next: (data: any[]) => {
        this.listaProductos = (data || []).map((p: any) => ({
          ...p,
          id_producto: p.id_productos || p.id_producto || p.id,
          categoria_nombre: p.categoria || p.categoria_nombre || 'General',
          precio_pvp: p.pvp_final ?? p.precio_pvp ?? p.precio ?? 0,
          precio_lista: p.precio_lista ?? 0,
          stock: p.stock ?? 0
        }));

        this.productosFiltrados = this.listaProductos;
        this.calcularResumen();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar catálogo PVP:', err);
        this.errorMessage = 'No se pudieron cargar los productos del catálogo.';
        this.cdr.detectChanges();
      }
    });
  }

  calcularResumen() {
    this.totalActivos = this.listaProductos.filter(
      p => p.activo == '1' || p.activo === true || (p.stock ?? 0) > 0
    ).length;
    this.totalSinStock = this.listaProductos.filter(p => (p.stock ?? 0) <= 0).length;
    this.totalRevision = this.listaProductos.length - this.totalActivos - this.totalSinStock;
    if (this.totalRevision < 0) this.totalRevision = 0;
  }

  filtrarPorCategoria(categoria: string) {
    this.categoriaSeleccionada = categoria;
    if (categoria === 'Todos') {
      this.productosFiltrados = this.listaProductos;
    } else {
      this.productosFiltrados = this.listaProductos.filter(
        producto => producto.categoria_nombre?.toLowerCase() === categoria.toLowerCase()
      );
    }
  }

  seleccionarProducto(producto: any) {
    this.errorMessage = '';
    this.productoSeleccionado = producto;
    this.isModalOpen = true;
  }

  cerrarModal() {
    this.isModalOpen = false;
    this.productoSeleccionado = null;
  }

  private getPrecioUnitario(producto: any): number {
    const raw = producto?.precio_pvp ?? producto?.pvp_final ?? producto?.precio_lista ?? producto?.precio ?? 0;
    const num = parseValidNumber(raw);
    return num !== null && num > 0 ? num : 0;
  }

  agregarAlCarrito(producto: any, event?: Event) {
    event?.stopPropagation();
    this.errorMessage = '';

    if (!producto) {
      this.errorMessage = 'Producto no válido.';
      return;
    }

    const precio = this.getPrecioUnitario(producto);
    if (precio <= 0) {
      this.errorMessage = `El producto "${producto.modelo || producto.nombre || 'seleccionado'}" no tiene un precio válido.`;
      this.cdr.detectChanges();
      return;
    }

    const stockDisponible = parseValidNumber(producto.stock);
    if (stockDisponible === null || stockDisponible <= 0) {
      this.errorMessage = `El producto "${producto.modelo || producto.nombre || 'seleccionado'}" no tiene stock disponible.`;
      this.cdr.detectChanges();
      return;
    }

    const prodId = producto.id_productos || producto.id_producto || producto.id;
    const index = this.itemsCotizacion.findIndex(item => {
      const itemId = item.producto.id_productos || item.producto.id_producto || item.producto.id;
      return (prodId && itemId === prodId) || item.producto.modelo === producto.modelo;
    });

    if (index !== -1) {
      const nuevaCantidad = this.itemsCotizacion[index].cantidad + 1;
      if (nuevaCantidad > stockDisponible) {
        this.errorMessage = `Solo hay ${stockDisponible} unidad(es) disponibles de "${producto.modelo || producto.nombre}".`;
        this.cdr.detectChanges();
        return;
      }

      this.itemsCotizacion[index] = {
        ...this.itemsCotizacion[index],
        cantidad: nuevaCantidad
      };
    } else {
      this.itemsCotizacion.push({ producto, cantidad: 1 });
    }

    this.itemsCotizacion = [...this.itemsCotizacion];
    this.cdr.detectChanges();
  }

  removerItem(index: number) {
    if (index < 0 || index >= this.itemsCotizacion.length) return;
    this.errorMessage = '';
    this.itemsCotizacion.splice(index, 1);
    this.itemsCotizacion = [...this.itemsCotizacion];
    this.cdr.detectChanges();
  }

  get subtotal(): number {
    return this.itemsCotizacion.reduce((acc, item) => {
      const cantidad = parseValidNumber(item.cantidad) ?? 0;
      if (cantidad <= 0) return acc;
      return acc + this.getPrecioUnitario(item.producto) * cantidad;
    }, 0);
  }

  get iva(): number {
    return this.subtotal * 0.16;
  }

  get total(): number {
    return this.subtotal + this.iva;
  }

  comprarPorProducto(producto: any) {
    this.agregarAlCarrito(producto);
    if (!this.errorMessage) {
      this.cerrarModal();
    }
  }

  onPerfil() { this.router.navigate(['/perfil']); }
  onCatalogo() {
    if (this.datosUsuario?.rol === 'admin') {
      this.router.navigate(['/catalogo-admin']);
    } else {
      this.router.navigate(['/catalogo']);
    }
  }
  regresarMenu() { this.router.navigate(['/principal']); }
  cerrarSesion() { this.router.navigate(['/login']); }
  onCotizar() { this.router.navigate(['/cotizar']); }
  onSobreNosotros() { this.router.navigate(['/sobre-nosotros']); }
  onProveedores() { this.router.navigate(['/proveedores']); }

  onBuscarpoducto(event: any) {
    const texto = String(event?.target?.value ?? '').trim().toLowerCase();

    if (texto === '') {
      this.filtrarPorCategoria(this.categoriaSeleccionada);
      return;
    }

    const baseList =
      this.categoriaSeleccionada === 'Todos'
        ? this.listaProductos
        : this.listaProductos.filter(
            p => p.categoria_nombre?.toLowerCase() === this.categoriaSeleccionada.toLowerCase()
          );

    this.productosFiltrados = baseList.filter(producto => {
      const modelo = producto.modelo?.toLowerCase() || '';
      const descripcion = producto.descripcion?.toLowerCase() || '';
      const categoria = producto.categoria_nombre?.toLowerCase() || '';

      return modelo.includes(texto) || descripcion.includes(texto) || categoria.includes(texto);
    });
    this.cdr.detectChanges();
  }

  async enviarCotizacionPDF() {
    if (this.generandoPDF) return;
    this.errorMessage = '';

    if (this.itemsCotizacion.length === 0) {
      this.errorMessage = 'Tu lista de cotización está vacía. Selecciona al menos un producto.';
      alert('Tu lista de cotización está vacía. Selecciona al menos un producto.');
      return;
    }

    if (this.total <= 0) {
      this.errorMessage = 'El total de la cotización debe ser mayor que 0 para generar el PDF.';
      return;
    }

    const elemento = document.getElementById('plantilla-pdf');
    if (!elemento) {
      console.error('No se encontró la plantilla del PDF en el HTML');
      this.errorMessage = 'No se pudo preparar la plantilla de cotización.';
      return;
    }

    this.generandoPDF = true;

    try {
      const canvas = await html2canvas(elemento, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'letter');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Cotizacion_Nexaro_${new Date().getTime()}.pdf`);

      this.itemsCotizacion = [];
      this.generandoPDF = false;
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error al generar PDF:', err);
      this.generandoPDF = false;
      this.errorMessage = 'Ocurrió un error al generar el PDF de cotización.';
      this.cdr.detectChanges();
    }
  }

  onGestionProveedores() {
    this.router.navigate(['/proveedores']);
  }

  onConfigurarPrecios() {
    alert('Motor de Reglas de Márgenes activo.');
  }
}