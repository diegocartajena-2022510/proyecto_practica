import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../service/auth';
import { Router } from '@angular/router';
import { productosService } from '../../service/productosService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  itemsCotizacion: { producto: any; cantidad: number }[] = [];
  monedaSeleccionada: string = 'MXN';
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

  agregarAlCarrito(producto: any, event?: Event) {
    event?.stopPropagation();
    const index = this.itemsCotizacion.findIndex(item => 
      (item.producto.id_producto && item.producto.id_producto === producto.id_producto) ||
      (item.producto.id && item.producto.id === producto.id) ||
      (item.producto.modelo === producto.modelo)
    );

    if (index !== -1) {
      this.itemsCotizacion[index] = {
        ...this.itemsCotizacion[index],
        cantidad: this.itemsCotizacion[index].cantidad + 1
      };
    } else {
      this.itemsCotizacion.push({ producto, cantidad: 1 });
    }

    this.itemsCotizacion = [...this.itemsCotizacion];
    this.cdr.detectChanges();
  }

  removerItem(index: number) {
    this.itemsCotizacion.splice(index, 1);
    this.itemsCotizacion = [...this.itemsCotizacion];
    this.cdr.detectChanges();
  }

  get subtotal(): number {
    return this.itemsCotizacion.reduce((acc, item) => {
      const precio = item.producto.precio_pvp ?? item.producto.precio_lista ?? item.producto.precio ?? 0;
      return acc + (precio * item.cantidad);
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
    this.cerrarModal();
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
  onProveedores(){this.router.navigate(['/proveedores']);}

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

  enviarCotizacionPDF() {
    if (this.itemsCotizacion.length === 0) {
      alert('Tu lista de cotización está vacía. Selecciona al menos un producto.');
      return;
    }

    const elemento = document.getElementById('plantilla-pdf');
    if (!elemento) {
      console.error('No se encontró la plantilla del PDF en el HTML');
      return;
    }

    html2canvas(elemento, { scale: 2 }).then((canvas) => {
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
      this.cdr.detectChanges();
    });
  }
  onGestionProveedores() {
    alert('Módulo de Proveedores (Próximamente)');
  }

  onConfigurarPrecios() {
    alert('Motor de Reglas de Márgenes activo.');
  }
}