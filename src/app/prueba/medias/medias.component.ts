import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
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
  decimales: number = 4; // Inicialmente 4 decimales
  indiceConfianza: number = 0.95; // Índice de confianza predeterminado
  limiteSuperior: number | null = null;
  limiteInferior: number | null = null;
  alfaDiv2: number = 0; // α/2
  unoMenosAlfaDiv2: number = 0; // 1-α/2

  constructor(private dialog: MatDialog) {}

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
      const n = this.datosColumna.length;

      // Calcular α/2 y 1-α/2
      this.alfaDiv2 = this.indiceConfianza / 2;
      this.unoMenosAlfaDiv2 = 1 - this.alfaDiv2;

      // Calcular Z para α/2 y 1-α/2
      const zAlphaDiv2 = this.calcularZ(this.alfaDiv2);
      const zOneMinusAlphaDiv2 = this.calcularZ(this.unoMenosAlfaDiv2);

      this.resultado = parseFloat(media.toFixed(this.decimales));

      // Cálculo de límites
      const error = (1 / Math.sqrt(12 * n));
      this.limiteInferior = parseFloat(
        (0.5 + zAlphaDiv2 * error).toFixed(this.decimales)
      );
      this.limiteSuperior = parseFloat(
        (0.5 + zOneMinusAlphaDiv2 * error).toFixed(this.decimales)
      );

      // Abrir modal con la información
      this.dialog.open(DialogContentExampleDialog, {
        data: {
          n,
          resultado: this.resultado,
          limiteInferior: this.limiteInferior,
          limiteSuperior: this.limiteSuperior,
          zAlphaDiv2,
          zOneMinusAlphaDiv2,
          alfaDiv2: this.alfaDiv2,
          unoMenosAlfaDiv2: this.unoMenosAlfaDiv2,
          error
        }
      });
    } else {
      alert("No hay datos disponibles para calcular la media.");
    }
  }

  calcularZ(probabilidad: number): number {
    const zTable: { [key: string]: number } = {
      '0.90': 1.645,
      '0.95': 1.96,
      '0.99': 2.576
    };

    return zTable[probabilidad.toFixed(2)] || 0;
  }
}

@Component({
  selector: 'dialog-content-example-dialog',
  template: `
    <div class="dialog-container">
      <h1 mat-dialog-title>Resultados</h1>
      <div mat-dialog-content>
        <h3>Hipótesis:</h3>
        <p><strong>H₀:</strong> La media de los números PA generados = 1/2</p>
        <p><strong>H₁:</strong> La media de los números PA generados ≠ 1/2</p>

        <h3>Información de α/2 y 1-α/2</h3>
        <p><strong>α/2:</strong> {{data.alfaDiv2}}</p>
        <p><strong>1-α/2:</strong> {{data.unoMenosAlfaDiv2}}</p>

        <h3>Paso 1: Cálculo de la media</h3>
        <p><strong>Ecuación:</strong> x̄ = (1/n) ∑ xi</p>
        <p><strong>Reemplazando valores:</strong> x̄ = (1/{{data.n}}) ∑ xi</p>
        <p><strong>Resultado:</strong> {{data.resultado}}</p>

        <h3>Paso 2: Intervalo de aceptación</h3>
        <p><strong>Fórmula del límite inferior:</strong></p>
        <p>Límite Inferior = 1/2 + Z<sub>α/2</sub> * (1 / √(12 * n))</p>
        <p><strong>Desarrollo:</strong></p>
        <p>Límite Inferior = 0.5 + {{data.zAlphaDiv2}} * (1 / √(12 * {{data.n}}))</p>
        <p>Límite Inferior = {{data.limiteInferior}}</p>

        <p><strong>Fórmula del límite superior:</strong></p>
        <p>Límite Superior = 1/2 + Z<sub>1-α/2</sub> * (1 / √(12 * n))</p>
        <p><strong>Desarrollo:</strong></p>
        <p>Límite Superior = 0.5 + {{data.zOneMinusAlphaDiv2}} * (1 / √(12 * {{data.n}}))</p>
        <p>Límite Superior = {{data.limiteSuperior}}</p>
      </div>
      <div mat-dialog-actions>
        <button mat-button mat-dialog-close>Cerrar</button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-container {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
    }
    h3 {
      color: #4CAF50;
    }
    p {
      font-size: 16px;
      color: #333;
    }
    strong {
      color: #000;
    }
  `]
})
export class DialogContentExampleDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { 
    n: number, 
    resultado: number, 
    limiteInferior: number, 
    limiteSuperior: number, 
    zAlphaDiv2: number, 
    zOneMinusAlphaDiv2: number, 
    alfaDiv2: number, 
    unoMenosAlfaDiv2: number, 
    error: number 
  }) {}
}
