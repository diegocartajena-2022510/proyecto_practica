import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-sobre-nosotros',
  styleUrl: './sobre-nosotros.css',
  templateUrl: './sobre-nosotros.html',
})
export class SobreNosotros {
  constructor(private router: Router) {}

  regresarMenu() {
    this.router.navigate(['/principal']);
  }

  onCatalogo() {
    this.router.navigate(['/catalogo']);
  }

  onCotizar() {
    this.router.navigate(['/cotizar']);
  }

  OnSobreNosotros() {
    this.router.navigate(['/sobre-nosotros']);
  }

  cerrarSesion() {
    this.router.navigate(['/login']);
  }
}
