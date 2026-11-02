import { Routes } from '@angular/router';
import { Catalogo } from './components/catalogo/catalogo';
import { Cotizar } from './components/cotizar/cotizar';
import { Login } from './components/login/login';
import { Principal } from './components/principal/principal';
import { SobreNosotros } from './components/sobre-nosotros/sobre-nosotros';
import { Wlan } from './components/categorias/wlan/wlan';
import { Cctv } from './components/categorias/cctv/cctv';
import { PTP} from './components/categorias/ptp/ptp';
import { Control } from './components/control/control';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: Login },
  { path: 'principal', component: Principal },
  { path: 'catalogo', component: Catalogo },
  { path: 'cotizar', component: Cotizar },
  { path: 'sobre-nosotros', component: SobreNosotros },
  { path: 'wlan', component: Wlan },
  { path: 'cctv', component: Cctv },
  { path: 'ptp-ptmp', component: PTP },
  { path: 'control-acceso', component: Control }
];