import { Component, Inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProveedoresService } from '../../../service/proveedoresService';

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

  mostrarModalProveedor = false;
  modoEdicionProveedor = false;
  proveedorActual: any = { id_proveedores: null, nombre_proveedores: '', contacto_proveedores: '' };

  mostrarModalRegla = false;
  reglaActual: any = { id_regla: null, id_categoria: null, categoria_nombre: '', porcentaje_margen: 0 };

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
  }

  abrirModalNuevoProveedor() {
    this.modoEdicionProveedor = false;
    this.proveedorActual = { id_proveedores: null, nombre_proveedores: '', contacto_proveedores: '' };
    this.mostrarModalProveedor = true;
  }

  editarProveedor(prov: any) {
    this.modoEdicionProveedor = true;
    this.proveedorActual = {
      ...prov,
      id_proveedores: prov.id_proveedores || prov.id_proveedor || prov.id
    };
    this.mostrarModalProveedor = true;
  }

  cerrarModalProveedor() {
    this.mostrarModalProveedor = false;
  }

  guardarProveedor() {
    if (this.modoEdicionProveedor) {
      const id = this.proveedorActual.id_proveedores;
      this.pro.actualizarProveedor(id, this.proveedorActual).subscribe({
        next: () => {
          this.cargarDatos();
          this.cerrarModalProveedor();
        },
        error: (err) => console.error('Error al actualizar proveedor:', err)
      });
    } else {
      this.pro.crearProveedor(this.proveedorActual).subscribe({
        next: () => {
          this.cargarDatos();
          this.cerrarModalProveedor();
        },
        error: (err) => console.error('Error al crear proveedor:', err)
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
    this.reglaActual = {
      ...regla,
      categoria_nombre: regla.categoria_nombre || regla.nombre_categoria || regla.nombre || regla.categoria || 'Sin categoría'
    };
    this.mostrarModalRegla = true;
  }

  cerrarModalRegla() {
    this.mostrarModalRegla = false;
  }

  guardarRegla() {
    const id = this.reglaActual.id_regla || this.reglaActual.id_margen;
    
    this.pro.actualizarReglaMargen(id, this.reglaActual).subscribe({
      next: () => {
        this.cargarDatos();
        this.cerrarModalRegla();
      },
      error: (err) => console.error('Error al actualizar regla de margen:', err)
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