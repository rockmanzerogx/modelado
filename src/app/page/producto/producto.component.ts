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
    Y1j: number;
    Y2j: number;
    operacion: string;
    Xj: number;
    resultado: number;
    Rj: number;
    esDegenerado: boolean; // Identificar degeneración
  }[] = [];
  mensajeError: string = '';
  mostrarModal: boolean = false; // Control del modal
  datosDegenerados: any = null; // Datos específicos de degeneración

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      semilla1: [0, [Validators.required, Validators.min(0)]],
      semilla2: [0, [Validators.required, Validators.min(0)]],
      digitos: [4, [Validators.required, Validators.min(3)]],
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
  }

  calcularNumeros(): void {
    this.mensajeError = '';
    this.mostrarModal = false; // Reiniciar modal
    this.datosDegenerados = null; // Reiniciar datos de degeneración
    if (this.form.invalid) {
      if (this.form.controls['digitos'].hasError('min')) {
        this.mensajeError = 'La cantidad de dígitos centrales debe ser mayor o igual a 3.';
      }
      return;
    }

    const semilla1Inicial = this.form.value.semilla1;
    const semilla2Inicial = this.form.value.semilla2;
    const cantidad = this.form.value.cantidad;
    const digitosCentrales = this.form.value.digitos;

    let semilla1 = semilla1Inicial;
    let semilla2 = semilla2Inicial;
    const divisor = Math.pow(10, digitosCentrales);
    this.resultados = [];
    const numerosGenerados = new Set();
    let degeneracionEncontrada = false;

    for (let i = 0; i < cantidad; i++) {
      const Y1j = semilla1;
      const Y2j = semilla2;
      const producto = (semilla1 * semilla2).toString().padStart(digitosCentrales * 2, '0');

      const longitudProducto = producto.length;
      const inicio = Math.floor((longitudProducto - digitosCentrales) / 2);
      const fin = inicio + digitosCentrales;

      const Xj = parseInt(producto.substring(inicio, fin), 10);
      const operacion = `${semilla1} * ${semilla2} = ${producto}`;
      semilla1 = semilla2; // Actualizar semillas
      semilla2 = Xj;
      const resultado = Xj;
      const Rj = Xj / divisor;

      if (numerosGenerados.has(Xj) && !degeneracionEncontrada) {
        // Degeneración detectada: mostrar datos en el modal
        this.mostrarModal = true;
        this.datosDegenerados = {
          iteracion: i + 1,
          Y1j,
          Y2j,
          operacion,
          Xj,
          resultado,
          Rj
        };
        degeneracionEncontrada = true;

        // Marcar la fila como degenerada
        this.resultados.push({
          iteracion: i + 1,
          Y1j,
          Y2j,
          operacion,
          Xj,
          resultado,
          Rj,
          esDegenerado: true
        });
        break; // Detener iteraciones después de encontrar degeneración
      }

      numerosGenerados.add(Xj);

      this.resultados.push({
        iteracion: i + 1,
        Y1j,
        Y2j,
        operacion,
        Xj,
        resultado,
        Rj,
        esDegenerado: false
      });
    }
  }

  limpiarCampos(): void {
    this.form.reset({ semilla1: 0, semilla2: 0, digitos: 4, cantidad: 1 });
    this.resultados = [];
    this.mensajeError = '';
    this.mostrarModal = false;
    this.datosDegenerados = null;
  }
}


