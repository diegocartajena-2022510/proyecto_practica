import { Routes } from '@angular/router';
import { Catalogo } from './components/catalogo/catalogo';
import { Cotizar } from './components/cotizar/cotizar';
import { Login } from './components/login/login';
import { Principal } from './components/principal/principal';
import { SobreNosotros } from './components/sobre-nosotros/sobre-nosotros';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },
  { path: 'principal', component: Principal },
  { path: 'catalogo', component: Catalogo },
  { path: 'cotizar', component: Cotizar },
  { path: 'sobre-nosotros', component: SobreNosotros }
];