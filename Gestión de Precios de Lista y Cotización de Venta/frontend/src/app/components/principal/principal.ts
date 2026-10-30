import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-principal',
  styleUrl: './principal.css',
  templateUrl: './principal.html',
})
export class Principal {

  constructor(private router: Router) {}

  onCatalogo(){
    this.router.navigate(['/catalogo']);
  }

  regresarMenu(){
    this.router.navigate(['/principal']);
  }
  cerrarSesion(){
    this.router.navigate(['/login']);
  }
  onCotizar(){
    this.router.navigate(['/cotizar']);
  }
  OnSobreNosotros(){
    this.router.navigate(['/sobre-nosotros']);
  }
}
