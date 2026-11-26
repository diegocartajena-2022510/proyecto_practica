import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

export interface CampoEntidad {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'password';
  soloNumerosProhibido?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
  step?: string;
  options?: { value: any; label: string }[];
}

export interface ConfigEntidad {
  key: string;
  title: string;
  pk: string;
  endpoint: string;
  campos: CampoEntidad[];
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-admin-entidad',
  styleUrl: './admin-entidad.css',
  templateUrl: './admin-entidad.html'
})
export class AdminEntidad implements OnInit {
  entidadKey: string = '';
  configActual: ConfigEntidad | null = null;
  datosUsuario: any = { nombre: '', correo: '', rol: '' };

  registros: any[] = [];
  registrosFiltrados: any[] = [];
  columnasTabla: string[] = [];
  filtroTexto: string = '';

  cargando: boolean = false;
  guardando: boolean = false;
  eliminandoId: any = null;
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;
  registroActual: Record<string, any> = {};
  errorMessage: string = '';
  successMessage: string = '';

  configs: Record<string, ConfigEntidad> = {
    categoria: {
      key: 'categoria',
      title: 'Categorías',
      pk: 'id_categoria',
      endpoint: 'http://localhost:3000/api/categorias',
      campos: [
        { name: 'nombre', label: 'Nombre', type: 'text', required: true, soloNumerosProhibido: true }
      ]
    },
    marcas: {
      key: 'marcas',
      title: 'Marcas',
      pk: 'id_marca',
      endpoint: 'http://localhost:3000/api/marcas',
      campos: [
        { name: 'nombre', label: 'Nombre', type: 'text', required: true, soloNumerosProhibido: true }
      ]
    },
    productos: {
      key: 'productos',
      title: 'Productos',
      pk: 'id_productos',
      endpoint: 'http://localhost:3000/api/productos',
      campos: [
        { name: 'modelo', label: 'Modelo', type: 'text', required: true, soloNumerosProhibido: true },
        { name: 'descripcion', label: 'Descripción', type: 'text', required: false, soloNumerosProhibido: true },
        { name: 'id_categoria', label: 'ID Categoría', type: 'number', required: true, min: 1, step: '1' },
        { name: 'id_marca', label: 'ID Marca', type: 'number', required: true, min: 1, step: '1' },
        { name: 'precio_lista', label: 'Precio de lista', type: 'number', required: true, min: 0.01, step: '0.01' },
        { name: 'stock', label: 'Stock', type: 'number', required: true, min: 0, step: '1' },
        {
          name: 'moneda',
          label: 'Moneda',
          type: 'select',
          required: true,
          options: [
            { value: 'Q', label: 'Quetzales (Q)' },
            { value: 'USD', label: 'USD ($)' }
          ]
        },
        {
          name: 'activo',
          label: 'Estado',
          type: 'select',
          required: true,
          options: [
            { value: 'Activo', label: 'Activo' },
            { value: 'Inactivo', label: 'Inactivo' }
          ]
        }
      ]
    },
    proveedores: {
      key: 'proveedores',
      title: 'Proveedores',
      pk: 'id_proveedores',
      endpoint: 'http://localhost:3000/api/proveedores',
      campos: [
        { name: 'nombre_proveedores', label: 'Nombre del proveedor', type: 'text', required: true, soloNumerosProhibido: true },
        { name: 'contacto_proveedores', label: 'Contacto (máx. 10)', type: 'text', required: true }
      ]
    },
    reglas_margen: {
      key: 'reglas_margen',
      title: 'Reglas de Margen',
      pk: 'id_margen',
      endpoint: 'http://localhost:3000/api/reglas-margen',
      campos: [
        { name: 'id_categoria', label: 'ID Categoría', type: 'number', required: true, min: 1, step: '1' },
        { name: 'id_marca', label: 'ID Marca', type: 'number', required: true, min: 1, step: '1' },
        { name: 'porcentaje_margen', label: 'Porcentaje de margen', type: 'number', required: true, min: 0, max: 500, step: '0.01' }
      ]
    },
    tipo_cambio: {
      key: 'tipo_cambio',
      title: 'Tipo de Cambio',
      pk: 'id_tipo_cambio',
      endpoint: 'http://localhost:3000/api/tipo-cambio',
      campos: [
        { name: 'id_tipo_cambio', label: 'ID Tipo de Cambio', type: 'number', required: true, min: 1, step: '1' },
        { name: 'tasa', label: 'Tasa', type: 'number', required: true, min: 0.0001, step: '0.0001' }
      ]
    },
    usuario: {
      key: 'usuario',
      title: 'Usuarios',
      pk: 'id_usuario',
      endpoint: 'http://localhost:3000/api/usuarios',
      campos: [
        { name: 'nombre', label: 'Nombre', type: 'text', required: true, soloNumerosProhibido: true },
        { name: 'correo', label: 'Correo', type: 'text', required: true },
        { name: 'pasword', label: 'Contraseña', type: 'password', required: true },
        { name: 'telefono', label: 'Teléfono', type: 'text', required: false },
        {
          name: 'rol',
          label: 'Rol',
          type: 'select',
          required: true,
          options: [
            { value: 'usuario', label: 'Usuario' },
            { value: 'admin', label: 'Administrador' }
          ]
        }
      ]
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const localData = localStorage.getItem('usuario');
      if (localData) {
        this.datosUsuario = JSON.parse(localData);
      }
      if (this.datosUsuario?.rol !== 'admin') {
        this.router.navigate(['/principal']);
        return;
      }
    }

    this.route.paramMap.subscribe((params) => {
      const key = (params.get('entidad') || '').toLowerCase();
      this.entidadKey = key;
      this.configActual = this.configs[key] || null;
      this.filtroTexto = '';
      this.errorMessage = '';
      this.successMessage = '';
      this.registros = [];
      this.registrosFiltrados = [];
      this.columnasTabla = [];

      if (!this.configActual) {
        this.errorMessage = `La entidad "${key}" no está configurada.`;
        this.cdr.detectChanges();
        return;
      }

      this.cargarRegistros();
    });
  }

  private resolverPk(row: Record<string, any>): any {
    if (!row || !this.configActual) return null;
    if (row[this.configActual.pk] !== undefined) return row[this.configActual.pk];
    const candidato = Object.keys(row).find((k) => k.toLowerCase().startsWith('id'));
    return candidato ? row[candidato] : null;
  }

  private calcularColumnas(rows: any[]) {
    if (!rows || rows.length === 0) {
      this.columnasTabla = (this.configActual?.campos || []).map((c) => c.name);
      return;
    }
    const keys = Object.keys(rows[0]).filter((k) => !/password|pasword|contrasena|clave/i.test(k));
    this.columnasTabla = keys.slice(0, 7);
  }

  async cargarRegistros() {
    if (!this.configActual) return;
    this.cargando = true;
    this.errorMessage = '';

    try {
      const resp = await fetch(this.configActual.endpoint);
      const data = await resp.json().catch(() => []);
      if (!resp.ok) {
        throw new Error(data?.error || 'No se pudieron cargar los registros.');
      }
      this.registros = Array.isArray(data) ? data : (data?.data || []);
      this.calcularColumnas(this.registros);
      this.aplicarFiltro();
    } catch (err: any) {
      this.errorMessage = err?.message || 'Error al cargar los registros.';
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  aplicarFiltro() {
    const q = this.filtroTexto.trim().toLowerCase();
    if (!q) {
      this.registrosFiltrados = [...this.registros];
      return;
    }
    this.registrosFiltrados = this.registros.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(q)
    );
  }

  private crearRegistroVacio(): Record<string, any> {
    const obj: Record<string, any> = {};
    for (const campo of this.configActual?.campos || []) {
      if (campo.type === 'select' && campo.options && campo.options.length > 0) {
        obj[campo.name] = campo.options[0].value;
      } else if (campo.type === 'number') {
        obj[campo.name] = null;
      } else {
        obj[campo.name] = '';
      }
    }
    return obj;
  }

  abrirNuevo() {
    if (!this.configActual) return;
    this.modoEdicion = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.registroActual = this.crearRegistroVacio();
    this.mostrarModal = true;
  }

  abrirEditar(row: Record<string, any>) {
    if (!this.configActual) return;
    this.modoEdicion = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.registroActual = { ...row };
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.errorMessage = '';
    this.guardando = false;
  }

  private validarFormulario(): Record<string, any> | null {
    if (!this.configActual) return null;
    const payload: Record<string, any> = {};

    for (const campo of this.configActual.campos) {
      const rawVal = this.registroActual[campo.name];

      if (campo.type === 'number') {
        const num = rawVal === '' || rawVal === null || rawVal === undefined ? NaN : Number(rawVal);
        if (campo.required && !Number.isFinite(num)) {
          this.errorMessage = `El campo "${campo.label}" es obligatorio y debe ser numérico.`;
          return null;
        }
        if (Number.isFinite(num)) {
          if (campo.min !== undefined && num < campo.min) {
            this.errorMessage = `"${campo.label}" no puede ser menor que ${campo.min}.`;
            return null;
          }
          if (campo.max !== undefined && num > campo.max) {
            this.errorMessage = `"${campo.label}" no puede ser mayor que ${campo.max}.`;
            return null;
          }
          if (campo.step === '1' && !Number.isInteger(num)) {
            this.errorMessage = `"${campo.label}" debe ser un número entero.`;
            return null;
          }
          payload[campo.name] = num;
        }
      } else {
        const str = String(rawVal ?? '').trim();
        if (campo.required && !str) {
          this.errorMessage = `El campo "${campo.label}" es obligatorio.`;
          return null;
        }
        if (campo.soloNumerosProhibido && str && /^\d+(\.\d+)?$/.test(str)) {
          this.errorMessage = `"${campo.label}" no puede ser únicamente un número.`;
          return null;
        }
        payload[campo.name] = str;
      }
    }

    return payload;
  }

  async guardar() {
    if (!this.configActual || this.guardando) return;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = this.validarFormulario();
    if (!payload) return;

    const id = this.resolverPk(this.registroActual);
    const url = this.modoEdicion && id != null
      ? `${this.configActual.endpoint}/${id}`
      : this.configActual.endpoint;
    const method = this.modoEdicion && id != null ? 'PUT' : 'POST';

    this.guardando = true;
    try {
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data?.error || 'No se pudo guardar el registro.');
      }
      this.cerrarModal();
      this.successMessage = this.modoEdicion
        ? 'Registro actualizado correctamente.'
        : 'Registro creado correctamente.';
      await this.cargarRegistros();
    } catch (err: any) {
      this.errorMessage = err?.message || 'Error al guardar.';
      this.guardando = false;
      this.cdr.detectChanges();
    }
  }

  async eliminar(row: Record<string, any>) {
    if (!this.configActual) return;
    const id = this.resolverPk(row);
    if (id == null || this.eliminandoId === id) return;

    if (!confirm('¿Seguro que deseas eliminar este registro?')) return;

    this.errorMessage = '';
    this.successMessage = '';
    this.eliminandoId = id;

    try {
      const resp = await fetch(`${this.configActual.endpoint}/${id}`, { method: 'DELETE' });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error(data?.error || 'No se pudo eliminar el registro.');
      }
      this.successMessage = 'Registro eliminado correctamente.';
      await this.cargarRegistros();
    } catch (err: any) {
      this.errorMessage = err?.message || 'Error al eliminar.';
    } finally {
      this.eliminandoId = null;
      this.cdr.detectChanges();
    }
  }

  volverPrincipal() {
    this.router.navigate(['/principal']);
  }
}