import { Component, Inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProveedoresService } from '../../../service/proveedoresService';

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
function isValidContacto(value: string): boolean {
  const limpio = value.trim();
  if (!limpio) return false;

  if (limpio.includes('@')) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio);
  }

  const soloDigitos = limpio.replace(/[\s-]/g, '');
  return /^\d{8}$/.test(soloDigitos);
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-proveedores',
  styleUrl: './proveedores.css',
  templateUrl: './proveedores.html',
})
export class Proveedores implements OnInit {
  datosUsuario: any = { nombre: '', correo: '', rol: '' };

  listarProveedores: any[] = [];
  listarMargen: any[] = [];
  listarCategorias: any[] = [];

  errorMessage: string = '';
  guardandoProveedor: boolean = false;
  guardandoRegla: boolean = false;
  guardandoTasa: boolean = false;

  mostrarModalProveedor = false;
  modoEdicionProveedor = false;
  proveedorActual: any = { id_proveedores: null, nombre_proveedores: '', contacto_proveedores: '' };

  mostrarModalRegla = false;
  reglaActual: any = { id_regla: null, id_categoria: null, categoria_nombre: '', porcentaje_margen: 0 };

  tasaCambio: number = 1.000;
  archivoSeleccionado: File | null = null;
  mensajeImportacion: string = '';
  cargandoImportacion: boolean = false;

  constructor(
    private router: Router,
    private pro: ProveedoresService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private plataformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.plataformId)) {
      const localData = localStorage.getItem('usuario');
      if (localData) {
        this.datosUsuario = JSON.parse(localData);
      }
      this.cargarDatos();
    }
  }

  cargarDatos() {
    this.pro.listarProveedores().subscribe({
      next: (data) => {
        this.listarProveedores = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar proveedores:', err)
    });

    this.pro.listarReglasMargen().subscribe({
      next: (data) => {
        this.listarMargen = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar lista de margen:', err)
    });

    this.pro.listarCategorias().subscribe({
      next: (data) => {
        this.listarCategorias = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar categorías:', err)
    });

    this.pro.obtenerTipoCambio().subscribe({
      next: (data) => {
        if (data && data.tasa) {
          this.tasaCambio = Number(data.tasa);
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error al obtener el tipo de cambio', err)
    });
  }

  abrirModalNuevoProveedor() {
    this.modoEdicionProveedor = false;
    this.errorMessage = '';
    this.guardandoProveedor = false;
    this.proveedorActual = { id_proveedores: null, nombre_proveedores: '', contacto_proveedores: '' };
    this.mostrarModalProveedor = true;
  }

  editarProveedor(prov: any) {
    this.modoEdicionProveedor = true;
    this.errorMessage = '';
    this.guardandoProveedor = false;
    this.proveedorActual = {
      ...prov,
      id_proveedores: prov.id_proveedores || prov.id_proveedor || prov.id
    };
    this.mostrarModalProveedor = true;
  }

  cerrarModalProveedor() {
    this.mostrarModalProveedor = false;
    this.errorMessage = '';
    this.guardandoProveedor = false;
  }

  guardarProveedor() {
    if (this.guardandoProveedor) return;
    this.errorMessage = '';

    const nombreLimpio = String(this.proveedorActual?.nombre_proveedores ?? '').trim();
    const contactoLimpio = String(this.proveedorActual?.contacto_proveedores ?? '').trim();

    if (TextoVacio(nombreLimpio)) {
      this.errorMessage = 'El nombre del proveedor es obligatorio.';
      return;
    }

    if (soloNumeros(nombreLimpio)) {
      this.errorMessage = 'El nombre del proveedor no puede ser únicamente un número.';
      return;
    }

    if (TextoVacio(contactoLimpio)) {
      this.errorMessage = 'El contacto del proveedor es obligatorio.';
      return;
    }

    if (!isValidContacto(contactoLimpio)) {
      this.errorMessage = 'El contacto no puede ser únicamente un número.';
      return;
    }

    const payload = {
      ...this.proveedorActual,
      nombre_proveedores: nombreLimpio,
      contacto_proveedores: contactoLimpio
    };

    this.guardandoProveedor = true;

    if (this.modoEdicionProveedor) {
      const id = payload.id_proveedores;
      if (!id) {
        this.guardandoProveedor = false;
        this.errorMessage = 'No se encontró el identificador del proveedor.';
        return;
      }

      this.pro.actualizarProveedor(id, payload).subscribe({
        next: () => {
          this.guardandoProveedor = false;
          this.cargarDatos();
          this.cerrarModalProveedor();
        },
        error: (err) => {
          this.guardandoProveedor = false;
          console.error('Error al actualizar proveedor:', err);
          this.errorMessage = err.error?.error || 'No se pudo actualizar el proveedor.';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.pro.crearProveedor(payload).subscribe({
        next: () => {
          this.guardandoProveedor = false;
          this.cargarDatos();
          this.cerrarModalProveedor();
        },
        error: (err) => {
          this.guardandoProveedor = false;
          console.error('Error al crear proveedor:', err);
          this.errorMessage = err.error?.error || 'No se pudo crear el proveedor.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  eliminarProveedor(prov: any) {
    const id = prov.id_proveedores || prov.id_proveedor || prov.id;
    if (!id) return;

    if (confirm(`¿Estás seguro de eliminar al proveedor "${prov.nombre_proveedores || ''}"?`)) {
      this.pro.eliminarProveedor(id).subscribe({
        next: () => {
          this.listarProveedores = this.listarProveedores.filter(
            p => (p.id_proveedores || p.id_proveedor || p.id) !== id
          );
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }

  editarRegla(regla: any) {
    this.errorMessage = '';
    this.guardandoRegla = false;
    this.reglaActual = {
      ...regla,
      id_regla: regla.id_regla || regla.id_margen || regla.id
    };
    this.mostrarModalRegla = true;
  }

  cerrarModalRegla() {
    this.mostrarModalRegla = false;
    this.errorMessage = '';
    this.guardandoRegla = false;
  }

  guardarRegla() {
    if (this.guardandoRegla) return;
    this.errorMessage = '';

    const id = this.reglaActual?.id_regla || this.reglaActual?.id_margen;
    const margenNum = parseValidNumber(this.reglaActual?.porcentaje_margen);

    if (margenNum === null || margenNum < 0 || margenNum > 500) {
      this.errorMessage = 'El porcentaje de margen debe ser un número válido entre 0 y 500.';
      return;
    }

    const payload = {
      ...this.reglaActual,
      porcentaje_margen: margenNum
    };

    this.guardandoRegla = true;

    this.pro.actualizarReglaMargen(id, payload).subscribe({
      next: () => {
        this.guardandoRegla = false;
        this.cargarDatos();
        this.cerrarModalRegla();
      },
      error: (err) => {
        this.guardandoRegla = false;
        console.error('Error al actualizar regla de margen:', err);
        this.errorMessage = err.error?.error || 'No se pudo actualizar la regla de margen.';
        this.cdr.detectChanges();
      }
    });
  }

  guardarTipoCambio() {
    if (this.guardandoTasa) return;
    this.errorMessage = '';

    const tasaNum = parseValidNumber(this.tasaCambio);
    if (tasaNum === null || tasaNum <= 0 || tasaNum > 1000) {
      this.errorMessage = 'Ingresa un tipo de cambio válido mayor que 0.';
      alert('Ingresa un tipo de cambio válido mayor que 0.');
      return;
    }

    this.tasaCambio = tasaNum;
    this.guardandoTasa = true;

    this.pro.actualizarTipoCambio(tasaNum).subscribe({
      next: () => {
        this.guardandoTasa = false;
        alert('Tipo de cambio actualizado correctamente.');
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.guardandoTasa = false;
        console.error('Error al actualizar tipo de cambio', err);
        this.mensajeImportacion = '';
        this.errorMessage = err.error?.error || 'No se pudo actualizar el tipo de cambio.';
        this.cdr.detectChanges();
      }
    });
  }

  onArchivoSeleccionado(event: any) {
    const file: File | undefined = event?.target?.files?.[0];
    this.mensajeImportacion = '';

    if (!file) {
      this.archivoSeleccionado = null;
      return;
    }

    const nombreLower = file.name.toLowerCase();
    const extensionValida =
      nombreLower.endsWith('.xlsx') ||
      nombreLower.endsWith('.xls') ||
      nombreLower.endsWith('.csv');

    if (!extensionValida) {
      this.archivoSeleccionado = null;
      event.target.value = '';
      this.mensajeImportacion = 'Error: Solo se permiten archivos .xlsx, .xls o .csv.';
      this.cdr.detectChanges();
      return;
    }

    const maxBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size <= 0 || file.size > maxBytes) {
      this.archivoSeleccionado = null;
      event.target.value = '';
      this.mensajeImportacion = 'Error: El archivo debe tener contenido y pesar máximo 5 MB.';
      this.cdr.detectChanges();
      return;
    }

    this.archivoSeleccionado = file;
  }

  subirArchivoExcel() {
    if (this.cargandoImportacion) return;

    if (!this.archivoSeleccionado) {
      this.mensajeImportacion = 'Por favor seleccione un archivo Excel o CSV válido primero.';
      alert('Por favor seleccione un archivo Excel o CSV primero.');
      return;
    }

    this.cargandoImportacion = true;
    this.mensajeImportacion = '';

    this.pro.importarProductos(this.archivoSeleccionado).subscribe({
      next: (res: any) => {
        this.mensajeImportacion = res?.message || 'Importación completada.';
        this.archivoSeleccionado = null;
        this.cargandoImportacion = false;
        this.cargarDatos();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.mensajeImportacion = 'Error: ' + (err.error?.error || 'No se pudo procesar el archivo.');
        this.cargandoImportacion = false;
        this.cdr.detectChanges();
      }
    });
  }

  regresarMenu() { this.router.navigate(['/principal']); }
  onCatalogo() {
    this.router.navigate([this.datosUsuario?.rol === 'admin' ? '/catalogo-admin' : '/catalogo']);
  }

  OnSobreNosotros() { this.router.navigate(['/sobre-nosotros']); }
  onPerfil() { this.router.navigate(['/perfil']); }
  cerrarSesion() { this.router.navigate(['/login']); }
}