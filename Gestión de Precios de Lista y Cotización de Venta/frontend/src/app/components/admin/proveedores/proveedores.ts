import { Component, Inject, OnInit, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ProveedoresService } from '../../../service/proveedoresService';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-proveedores',
  styleUrl: './proveedores.css',
  templateUrl: './proveedores.html',
})
export class Proveedores implements OnInit {
  datosUsuario: any = { nombre: '', correo: '', rol: '' };

  listarProveedores: any[] = [];
  listarMargen: any[] = [];

  constructor(
    private router: Router, 
    private pro: ProveedoresService, 
    private cdr: ChangeDetectorRef, // 1. Inyectamos ChangeDetectorRef aquí
    @Inject(PLATFORM_ID) private plataformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.plataformId)) {
      const localData = localStorage.getItem('usuario');
      if (localData) {
        this.datosUsuario = JSON.parse(localData);
      }
    }
    this.cargarDatos();
  }

  cargarDatos() {
    this.pro.listarProveedores().subscribe({
      next: (data) => {
        this.listarProveedores = data || [];
        this.cdr.detectChanges(); // 2. Forzamos a Angular a pintar los proveedores de inmediato
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
      }
    });

    this.pro.listarReglasMargen().subscribe({
      next: (data) => {
        this.listarMargen = data || [];
        this.cdr.detectChanges(); // 3. Forzamos a Angular a pintar las reglas de margen de inmediato
      },
      error: (err) => {
        console.error('Error al cargar lista de margen:', err);
      }
    });
  }

  regresarMenu() {
    this.router.navigate(['/principal']);
  }

  onCatalogo() {
    if (this.datosUsuario?.rol === 'admin') {
      this.router.navigate(['/catalogo-admin']);
    } else {
      this.router.navigate(['/catalogo']); // La vista para clientes normales
    }
  }

  OnSobreNosotros() {
    this.router.navigate(['/sobre-nosotros']);
  }

  onPerfil() {
    this.router.navigate(['/perfil']);
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }

  abrirModalNuevoProveedor() {
    alert('Abrir modal de nuevo proveedor');
  }

  editarProveedor(prov: any) {
    alert(`Editar proveedor: ${prov.nombre_proveedores}`);
  }

  eliminarProveedor(prov: any) {
    const id = prov.id_proveedores || prov.id_proveedor || prov.id;

    if (!id) {
      console.error("El ID del proveedor es inválido o undefined");
      return;
    }

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
    alert(`Editar regla de margen ID: ${regla.id_regla}`);
  }
}