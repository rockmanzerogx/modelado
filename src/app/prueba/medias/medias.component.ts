import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-medias',
  imports: [CommonModule,
    ReactiveFormsModule,FormsModule],
  templateUrl: './medias.component.html',
  styleUrl: './medias.component.css'
})
export class MediasComponent {
  datos: any[][] = [];
  columnaSeleccionada: number = 0; // Por defecto, la primera columna
  datosColumna: number[] = [];
  resultado: number | null = null;
  decimales: number = 2; // Número de decimales a mostrar
  indiceConfianza: number = 0.95; // Índice de confianza predeterminado
  limiteSuperior: number | null = null;
  limiteInferior: number | null = null;
  estadisticoDentroDelRango: boolean | null = null;

  cargarExcel(event: any): void {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      this.datos = jsonData as any[][];
      this.actualizarColumna();
    };

    reader.readAsArrayBuffer(file);
  }

  actualizarColumna(): void {
    this.datosColumna = this.datos
      .map(fila => fila[this.columnaSeleccionada])
      .filter(valor => !isNaN(parseFloat(valor)) && valor !== undefined);
  }

  pruebaDeMedias(): void {
    if (this.datosColumna.length > 0) {
      const suma = this.datosColumna.reduce((acc, num) => acc + num, 0);
      const media = suma / this.datosColumna.length;
      const desviacionEstandar = Math.sqrt(
        this.datosColumna
          .map(num => Math.pow(num - media, 2))
          .reduce((acc, val) => acc + val, 0) / this.datosColumna.length
      );

      // Verificar que el índice de confianza está en el rango válido
      if (this.indiceConfianza <= 0 || this.indiceConfianza >= 1) {
        alert("El índice de confianza debe estar entre 0 y 1.");
        return;
      }

      // Calcular Z (usando método corregido)
      const zScore = this.calcularZ(this.indiceConfianza);

      const margenError = zScore * (desviacionEstandar / Math.sqrt(this.datosColumna.length));
      this.limiteInferior = parseFloat((media - margenError).toFixed(this.decimales));
      this.limiteSuperior = parseFloat((media + margenError).toFixed(this.decimales));
      this.resultado = parseFloat(media.toFixed(this.decimales));

      // Verificar si la media está dentro del rango
      this.estadisticoDentroDelRango =
        this.resultado >= this.limiteInferior && this.resultado <= this.limiteSuperior;
    } else {
      this.resultado = null;
      this.limiteInferior = null;
      this.limiteSuperior = null;
      this.estadisticoDentroDelRango = null;
    }
  }

  calcularZ(confianza: number): number {
    // Aproximación simple de Z basado en el índice de confianza
    const zTable: { [key: string]: number } = {
      '0.90': 1.645,
      '0.95': 1.96,
      '0.99': 2.576
    };

    const zKeys = Object.keys(zTable).map(key => parseFloat(key));
    if (zTable[confianza.toFixed(2)]) {
      return zTable[confianza.toFixed(2)];
    } else {
      // Interpolar entre valores cercanos
      const lower = Math.max(...zKeys.filter(k => k < confianza));
      const upper = Math.min(...zKeys.filter(k => k > confianza));
      return (
        zTable[lower.toFixed(2)] +
        ((confianza - lower) / (upper - lower)) * (zTable[upper.toFixed(2)] - zTable[lower.toFixed(2)])
      );
    }
  }
}
