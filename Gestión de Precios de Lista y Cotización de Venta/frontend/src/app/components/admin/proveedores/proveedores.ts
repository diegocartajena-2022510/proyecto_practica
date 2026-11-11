import {ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
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
    @Inject(PLATFORM_ID) private plataformId: Object,
    private cdr:ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.plataformId)) {
      const localData = localStorage.getItem('usuario');
      this.cdr.detectChanges()
      if (localData) {
        this.datosUsuario = JSON.parse(localData);
        this.cdr.detectChanges()
      }
    }
    this.cargarDatos();
    this.cdr.detectChanges()
  }

  cargarDatos() {
    this.pro.listarProveedores().subscribe({
      next: (data) => {
        this.listarProveedores = data;
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
      }
    });

    this.pro.listarReglasMargen().subscribe({
      next: (data) => {
        this.listarMargen = data;
      },
      error: (err) => {
        console.error('Error al cargar reglas de margen:', err);
      }
    });
  }

  regresarMenu() {
    this.router.navigate(['/principal']);
  }

  onCatalogo() {
    this.router.navigate(['/catalogo']);
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
  console.log("Objeto proveedor recibido:", prov);
  
  const id = prov.id_proveedores || prov.id_proveedor || prov.id;

  if (!id) {
    console.error("El ID del proveedor es inválido o undefined");
    return;
  }

  if (confirm(`¿Estás seguro de eliminar al proveedor "${prov.nombre_proveedores || ''}"?`)) {
    this.pro.eliminarProveedor(id).subscribe({
      next: () => {
        this.cargarDatos();
        this.cdr.detectChanges()
      },
      error: (err) => console.error('Error al eliminar:', err)
    });
  }
}

  editarRegla(regla: any) {
    alert(`Editar regla de margen ID: ${regla.id_regla}`);
  }
}