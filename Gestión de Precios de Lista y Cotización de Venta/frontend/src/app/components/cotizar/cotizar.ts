import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-cotizar',
  styleUrl: './cotizar.css',
  templateUrl: './cotizar.html',
})
export class Cotizar {
  constructor(private router: Router) {}

  regresarMenu() {
    this.router.navigate(['/principal']);
  }

  onCatalogo() {
    this.router.navigate(['/catalogo']);
  }

  onSobreNosotros() {
    this.router.navigate(['/sobre-nosotros']);
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }
}
