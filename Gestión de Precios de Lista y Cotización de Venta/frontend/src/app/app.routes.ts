import { Routes } from '@angular/router';
import { Catalogo } from './components/catalogo/catalogo';
import { Login } from './components/login/login';
import { Perfil } from './components/perfil/perfil';
import { Principal } from './components/principal/principal';
import { SobreNosotros } from './components/sobre-nosotros/sobre-nosotros';
import { Proveedores } from './components/admin/proveedores/proveedores';
import { CatalogoAdmin } from './components/admin/catalogo-admin/catalogo-admin';
import { AdminEntidad } from './components/admin/admin-entidad/admin-entidad';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },
  { path: 'principal', component: Principal },
  { path: 'catalogo', component: Catalogo },
  { path: 'perfil', component: Perfil },
  { path: 'sobre-nosotros', component: SobreNosotros },
  {path: 'proveedores', component:Proveedores},
  {path:'catalogo-admin',component:CatalogoAdmin},
  {path:'admin-edntidad',component:AdminEntidad}

];