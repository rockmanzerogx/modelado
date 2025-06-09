import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-medias',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './medias.component.html',
  styleUrl: './medias.component.css'
})
export class MediasComponent {
  datos: any[][] = [];
  columnaSeleccionada: number = 0; // Por defecto, la primera columna
  datosColumna: number[] = [];
  resultado: number | null = null;
  decimales: number = 4; // Inicialmente 4 decimales
  indiceConfianza: number = 0.94; // Índice de confianza predeterminado
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
      const alfa = 1 - this.indiceConfianza;
      this.alfaDiv2 = parseFloat((alfa / 2).toFixed(4));
      this.unoMenosAlfaDiv2 = parseFloat((1 - this.alfaDiv2).toFixed(4));

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

  // Aproximación de la inversa de la normal estándar (probit)
  calcularZ(probabilidad: number): number {
    // Usamos la función de aproximación de Peter John Acklam
    // https://web.archive.org/web/20150910062742/http://home.online.no/~pjacklam/notes/invnorm/
    if (probabilidad <= 0 || probabilidad >= 1) {
      throw new Error('La probabilidad debe estar entre 0 y 1');
    }
    const a1 = -39.6968302866538, a2 = 220.946098424521, a3 = -275.928510446969;
    const a4 = 138.357751867269, a5 = -30.6647980661472, a6 = 2.50662827745924;
    const b1 = -54.4760987982241, b2 = 161.585836858041, b3 = -155.698979859887;
    const b4 = 66.8013118877197, b5 = -13.2806815528857;
    const c1 = -0.00778489400243029, c2 = -0.322396458041136, c3 = -2.40075827716184;
    const c4 = -2.54973253934373, c5 = 4.37466414146497, c6 = 2.93816398269878;
    const d1 = 0.00778469570904146, d2 = 0.32246712907004, d3 = 2.445134137143;
    const d4 = 3.75440866190742;
    const pLow = 0.02425;
    const pHigh = 1 - pLow;
    let q, r, z;

    if (probabilidad < pLow) {
      q = Math.sqrt(-2 * Math.log(probabilidad));
      z = (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
          ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    } else if (probabilidad <= pHigh) {
      q = probabilidad - 0.5;
      r = q * q;
      z = (((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q /
          (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
    } else {
      q = Math.sqrt(-2 * Math.log(1 - probabilidad));
      z = -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) /
           ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
    }
    return z;
  }
}

@Component({
  selector: 'dialog-content-example-dialog',
  imports: [CommonModule],
  template: `
    <div class="dialog-container">
      <h1 mat-dialog-title>Resultados</h1>
      <div mat-dialog-content>
        <h3>Hipótesis:</h3>
        <p><strong>H₀:</strong> La media de los números PA generados = 1/2</p>
        <p><strong>H₁:</strong> La media de los números PA generados ≠ 1/2</p>

        <h3>Información de α/2 y 1-α/2</h3>
        <p><strong>α/2:</strong> {{data.alfaDiv2}}
        <strong>1-α/2:</strong> {{data.unoMenosAlfaDiv2}}</p>

        <h3>Paso 1: Cálculo de la media</h3>
        <p><strong>Ecuación:</strong> x̄ = (1/n) Σ xᵢ =>
        x̄ = (1/{{data.n}}) Σ xᵢ</p>
        <p><strong>Resultado:</strong> {{data.resultado}}</p>

        <h3>Paso 2: Intervalo de aceptación</h3>
        <p><strong>Fórmula del límite inferior:</strong></p>
        <p>Límite Inferior = 0.5 + Z(α/2) * (1/√(12n))</p>
        <p><strong>Resultado:</strong></p>
        <p>Límite Inferior = {{data.limiteInferior}}</p>

        <p><strong>Fórmula del límite superior:</strong></p>
        <p>Límite Superior = 0.5 + Z(1-α/2) * (1/√(12n))</p>
        <p><strong>Resultado:</strong></p>
        <p>Límite Superior = {{data.limiteSuperior}}</p>

        <h3>Conclusión:</h3>
        <p>
          <strong>La Media {{data.resultado}} se encuentra en el intervalo: </strong>
          [{{data.limiteInferior}} , {{data.limiteSuperior}}]
        </p>
        <ng-container *ngIf="data.resultado >= data.limiteInferior && data.resultado <= data.limiteSuperior; else fueraRango">
          <p style="color: green;">
            <strong>La media calculada está dentro del rango de aceptación. Se acepta la hipótesis H₀.</strong>
          </p>
        </ng-container>
        <ng-template #fueraRango>
          <p style="color: red;">
            <strong>La media calculada está fuera del rango de aceptación. Se rechaza la hipótesis H₀.</strong>
          </p>
        </ng-template>
      </div>
      <div mat-dialog-actions>
        <button mat-button (click)="cerrar()">Cerrar</button>
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
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogContentExampleDialog>
  ) {}

  cerrar() {
    this.dialogRef.close();
  }
}
