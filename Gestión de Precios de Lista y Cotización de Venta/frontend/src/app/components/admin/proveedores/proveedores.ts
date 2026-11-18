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
  listarCategorias: any[]=[];

  mostrarModalProveedor = false;
  modoEdicionProveedor = false;
  proveedorActual: any = { id_proveedores: null, nombre_proveedores: '', contacto_proveedores: '' };

  mostrarModalRegla = false;
  reglaActual: any = { id_regla: null, id_categoria: null, categoria_nombre: '', porcentaje_margen: 0 };

  tasaCambio:number=1.000;
  archivoSeleccionado:File|null=null;
  mensajeImportacion:String='';
  cargandoImportacion:boolean=false;

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
      next:(data)=>{
        if(data && data.tasa){
          this.tasaCambio=data.tasa;
          this.cdr.detectChanges();
        }
      },
      error: (err)=>console.error('Error al obtener el tipo de cambio', err  )
    })
  
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
      id_regla: regla.id_regla || regla.id_margen || regla.id
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

  guardarTipoCambio(){
    if(!this.tasaCambio||this.tasaCambio<=0)return;

    this.pro.actualizarTipoCambio(this.tasaCambio).subscribe({
        next:()=>{
          alert('tipo fr cambio actualizado correctaemente');
        },
        error:(err)=>console.error('Error al actualizar tipo de cambio',err)
    })
  }

 onArchivoSeleccionado(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      this.mensajeImportacion = '';
    }
  }
  subirArchivoExcel(){
    if(!this.archivoSeleccionado){
      alert('porfavor seleccione un archivo excel o csv primero');
      return;
    }
    this.cargandoImportacion=true;
    this.pro.importarProductos(this.archivoSeleccionado).subscribe({
      next:(res:any)=>{
        this.mensajeImportacion=res.message|| 'importacion completada';
        this.archivoSeleccionado=null
        this.cargandoImportacion=false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.mensajeImportacion = 'Error: ' + (err.error?.error || 'No se pudo procesar el archivo.');
        this.cargandoImportacion = false;
        this.cdr.detectChanges();
      }
    })
  }
  regresarMenu() { this.router.navigate(['/principal']); }
  onCatalogo() {
    this.router.navigate([this.datosUsuario?.rol === 'admin' ? '/catalogo-admin' : '/catalogo']);
  }
 
  OnSobreNosotros() { this.router.navigate(['/sobre-nosotros']); }
  onPerfil() { this.router.navigate(['/perfil']); }
  cerrarSesion() { this.router.navigate(['/login']); }
}

