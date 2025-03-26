import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-producto',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './producto.component.html',
  styleUrl: './producto.component.css'
})
export class ProductoComponent {
  form: FormGroup;
  resultados: {
    iteracion: number;
    semilla1: number;
    semilla2: number;
    operacion: string;
    producto: number;
    resultado: number;
    Rj: number;
  }[] = [];
  mensajeError: string = '';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      semilla1: [0, [Validators.required, Validators.min(0)]],
      semilla2: [0, [Validators.required, Validators.min(0)]],
      cantidad: [10, [Validators.required, Validators.min(1)]]
    }, { validators: this.validarLongitudSemillas });
  }

  validarLongitudSemillas(form: FormGroup) {
    const semilla1 = form.get('semilla1')?.value.toString();
    const semilla2 = form.get('semilla2')?.value.toString();
    if (semilla1 && semilla2 && semilla1.length !== semilla2.length) {
      return { longitudNoCoincide: true };
    }
    return null;
  }

  contarDigitos(numero: number): number {
    return numero.toString().length;
  }

  calcularNumeros(): void {
    this.mensajeError = '';
    if (this.form.invalid) {
      this.mensajeError = 'Las semillas deben tener la misma longitud y no pueden ser negativas.';
      return;
    }

    const semilla1Inicial = this.form.value.semilla1;
    const semilla2Inicial = this.form.value.semilla2;
    const cantidadNumeros = this.form.value.cantidad;
    const cantidadDigitos = this.contarDigitos(semilla1Inicial);

    let semilla1 = semilla1Inicial;
    let semilla2 = semilla2Inicial;
    const divisor = Math.pow(10, cantidadDigitos);
    this.resultados = [];

    for (let i = 0; i < cantidadNumeros; i++) {
      const producto = semilla1 * semilla2;
      const productoStr = producto.toString().padStart(cantidadDigitos * 2, '0');
      const inicio = Math.floor((productoStr.length - cantidadDigitos) / 2);
      const resultado = parseInt(productoStr.substring(inicio, inicio + cantidadDigitos), 10);

      this.resultados.push({
        iteracion: i + 1,
        semilla1,
        semilla2,
        operacion: `${semilla1} * ${semilla2} = ${producto}`,
        producto,
        resultado,
        Rj: resultado / divisor
      });

      semilla1 = semilla2;
      semilla2 = resultado;
    }
  }

  limpiarCampos(): void {
    this.form.reset({ semilla1: 0, semilla2: 0, cantidad: 10 });
    this.resultados = [];
    this.mensajeError = '';
  }
}
