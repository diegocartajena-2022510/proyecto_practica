import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cotizar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cotizar.html',
  styleUrl: './cotizar.css'
})
export class Cotizar implements OnInit {
  // Datos del usuario actual logueado
  datosUsuario: any = {
    nombre: '',
    correo: '',
    telefono: ''
  };

  // Catálogo disponible para que el comprador seleccione
  productosDisponibles = [
    { id: 1, nombre: 'Fibra 200 Mbps', categoria: 'Internet', precio: 1250, desc: 'Fibra premium de alta velocidad' },
    { id: 2, nombre: 'Switch gestionado', categoria: 'Red', precio: 1980, desc: 'Equipamiento de conectividad avanzado' },
    { id: 3, nombre: 'Cámara 4K', categoria: 'CCTV', precio: 2140, desc: 'Videovigilancia de ultra alta definición' },
    { id: 4, nombre: 'Control de acceso', categoria: 'Seguridad', precio: 1690, desc: 'Acceso inteligente biométrico' },
    { id: 5, nombre: 'PABX cloud', categoria: 'Telefonía', precio: 980, desc: 'Telefonía IP en la nube sin planta física' }
  ];

  // Carrito / Ítems agregados a la cotización por el comprador
  itemsCotizacion: { producto: any; cantidad: number }[] = [];

  // Campos adicionales del formulario del comprador
  plazoSeleccionado: string = '30 días';
  monedaSeleccionada: string = 'MXN';
  notasAdicionales: string = '';

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

  // Agregar producto al carrito de cotización
  agregarAlCarrito(producto: any) {
    const itemExistente = this.itemsCotizacion.find(item => item.producto.id === producto.id);
    if (itemExistente) {
      itemExistente.cantidad++;
    } else {
      this.itemsCotizacion.push({ producto, cantidad: 1 });
    }
  }

  // Cambiar cantidad de un ítem
  actualizarCantidad(index: number, cambio: number) {
    this.itemsCotizacion[index].cantidad += cambio;
    if (this.itemsCotizacion[index].cantidad <= 0) {
      this.itemsCotizacion.splice(index, 1);
    }
  }

  // Eliminar un ítem del carrito
  removerItem(index: number) {
    this.itemsCotizacion.splice(index, 1);
  }

  // Cálculos automáticos
  get subtotal(): number {
    return this.itemsCotizacion.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  }

  get iva(): number {
    return this.subtotal * 0.16; // Calculado al 16% o ajuste según prefieras
  }

  get total(): number {
    return this.subtotal + this.iva;
  }

  // Enviar cotización
  enviarCotizacion() {
    if (this.itemsCotizacion.length === 0) {
      alert('Tu lista de cotización está vacía. Selecciona al menos un servicio.');
      return;
    }

    const propuestaFinal = {
      cliente: this.datosUsuario.nombre,
      correo: this.datosUsuario.correo,
      plazo: this.plazoSeleccionado,
      moneda: this.monedaSeleccionada,
      notas: this.notasAdicionales,
      items: this.itemsCotizacion,
      subtotal: this.subtotal,
      iva: this.iva,
      total: this.total,
      fecha: new Date()
    };

    console.log('Enviando propuesta de cotización:', propuestaFinal);
    alert('¡Propuesta de cotización enviada con éxito! Nos pondremos en contacto contigo.');
    
    // Limpiar carrito o redirigir
    this.itemsCotizacion = [];
    this.router.navigate(['/principal']);
  }

  // Navegación
  regresarMenu() { this.router.navigate(['/principal']); }
  onCatalogo() { this.router.navigate(['/catalogo']); }
  onSobreNosotros() { this.router.navigate(['/sobre-nosotros']); }
  irPerfil() { this.router.navigate(['/perfil']); }
  cerrarSesion() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('usuario');
    }
    this.router.navigate(['/login']);
  }
}