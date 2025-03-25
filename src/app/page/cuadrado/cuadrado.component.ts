import { CommonModule } from '@angular/common';
import { Component, Inject, NgModule } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({

  selector: 'app-cuadrado',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './cuadrado.component.html',
  styleUrl: './cuadrado.component.css'
})
export class CuadradoComponent {
  form: FormGroup;
  resultados: {
    iteracion: number;
    Yj: number;
    operacion: string;
    Xj: number;
    resultado: number;
    Rj: number;
    esDegenerado: boolean;
  }[] = [];
  mensajeError: string = '';
  mostrarModal: boolean = false;
  iteracionDegenerada: any = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      semilla: [0, [Validators.required, Validators.min(0)]],
      numero: [1, [Validators.required, Validators.min(0)]],
      digitos: [4, [Validators.required, Validators.min(3)]]
    });
  }

  calcularNumeros(): void {
    this.mensajeError = '';
    this.mostrarModal = false;
    this.iteracionDegenerada = null;
    if (this.form.invalid) {
      if (this.form.controls['digitos'].hasError('min')) {
        this.mensajeError = 'La cantidad de dígitos centrales debe ser mayor o igual a 3.';
      }
      return;
    }

    const semillaInicial = this.form.value.semilla;
    const cantidad = this.form.value.numero;
    const digitosCentrales = this.form.value.digitos;

    let semilla = semillaInicial;
    const divisor = Math.pow(10, digitosCentrales);
    this.resultados = [];
    const numerosGenerados = new Set();
    let degeneracionEncontrada = false;

    for (let i = 0; i < cantidad; i++) {
      const Yj = semilla;
      const cuadrado = (semilla * semilla).toString();

      // Corregir el cálculo de los índices inicial y final
      const longitudCuadrado = cuadrado.length;
      const inicio = Math.floor((longitudCuadrado - digitosCentrales) / 2);
      const fin = inicio + digitosCentrales;

      // Asegurarse de que el índice sea correcto y se extraigan los dígitos deseados
      const Xj = parseInt(cuadrado.substring(inicio, fin), 10);
      const operacion = `${semilla}^2 = ${cuadrado}`;
      semilla = Xj;
      const resultado = Xj;
      const Rj = Xj / divisor;

      if (numerosGenerados.has(Xj) && !degeneracionEncontrada) {
        this.mostrarModal = true;
        this.iteracionDegenerada = {
          iteracion: i + 1,
          Yj,
          operacion,
          Xj,
          resultado,
          Rj
        };
        degeneracionEncontrada = true;

        this.resultados.push({
          iteracion: i + 1,
          Yj,
          operacion,
          Xj,
          resultado,
          Rj,
          esDegenerado: true
        });

        continue;
      }

      if (degeneracionEncontrada && this.resultados.length - 1 === i) {
        this.resultados.push({
          iteracion: i + 1,
          Yj,
          operacion,
          Xj,
          resultado,
          Rj,
          esDegenerado: false
        });
        break;
      }

      numerosGenerados.add(Xj);

      this.resultados.push({
        iteracion: i + 1,
        Yj,
        operacion,
        Xj,
        resultado,
        Rj,
        esDegenerado: false
      });
    }
  }

  limpiarCampos(): void {
    this.form.reset({ semilla: 0, numero: 1, digitos: 4 });
    this.resultados = [];
    this.mensajeError = '';
    this.mostrarModal = false;
    this.iteracionDegenerada = null;
  }
}

