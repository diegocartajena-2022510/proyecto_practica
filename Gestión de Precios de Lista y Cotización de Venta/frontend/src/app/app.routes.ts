import { Routes } from '@angular/router';
import { Catalogo } from './components/catalogo/catalogo';
import { Login } from './components/login/login';
import { Principal } from './components/principal/principal';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },
  { path: 'principal', component: Principal },
  { path: 'catalogo', component: Catalogo }
];