import { Component, NgModule } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    //CuadradoComponent,
    //ProductoComponent,
    //LinealComponent,
    //MultiplicativoComponent,
    FormsModule,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'modelado';
  submitCuadrado(semilla: string, numero: string) {
    console.log(`Semilla: ${semilla}, Numero: ${numero}`);
  }

}
