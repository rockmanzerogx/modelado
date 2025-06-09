import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-varianza',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './varianza.component.html',
  styleUrl: './varianza.component.css'
})
export class VarianzaComponent {
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

  pruebaDeVarianza(): void {
    if (this.datosColumna.length > 1) {
      const n = this.datosColumna.length;
      const alfa = 1 - this.indiceConfianza;
      this.alfaDiv2 = parseFloat((alfa / 2).toFixed(4));
      this.unoMenosAlfaDiv2 = parseFloat((1 - this.alfaDiv2).toFixed(4));

      // Cálculo de la varianza
      const media = this.datosColumna.reduce((acc, num) => acc + num, 0) / n;
      const sumaCuadrados = this.datosColumna.reduce((acc, num) => acc + Math.pow(num - media, 2), 0);
      const varianza = sumaCuadrados / (n - 1);
      this.resultado = parseFloat(varianza.toFixed(this.decimales));

      // Interpolación para chi-cuadrada
      const gl = n - 1;
      let chi2_inf = interpolateChi2(gl, this.alfaDiv2);
      let chi2_sup = interpolateChi2(gl, this.unoMenosAlfaDiv2);

      this.limiteInferior = parseFloat((chi2_inf/(gl * 12)).toFixed(this.decimales));
      this.limiteSuperior = parseFloat((chi2_sup/(gl * 12)).toFixed(this.decimales));

      this.dialog.open(DialogContentExampleDialog, {
        data: {
          n,
          resultado: this.resultado,
          limiteInferior: this.limiteInferior,
          limiteSuperior: this.limiteSuperior,
          chi2_inf: chi2_inf.toFixed(4),
          chi2_sup: chi2_sup.toFixed(4),
          gl,
          alfaDiv2: this.alfaDiv2,
          unoMenosAlfaDiv2: this.unoMenosAlfaDiv2
        }
      });
    } else {
      alert("Se necesitan al menos dos datos para calcular la varianza.");
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
        <p><strong>H₀:</strong> La varianza de los números PA generados = 1/12</p>
        <p><strong>H₁:</strong> La varianza de los números PA generados ≠ 1/12</p>

        <h3>Información de α/2 y 1-α/2</h3>
        <p><strong>α/2:</strong> {{data.alfaDiv2}}</p>
        <p><strong>1-α/2:</strong> {{data.unoMenosAlfaDiv2}}</p>

        <h3>Paso 1: Cálculo de la varianza</h3>
        <p><strong>Reemplazando valores:</strong> S² = (1/({{data.n}}-1)) Σ (xᵢ - x̄)²</p>
        <p><strong>Resultado:</strong> {{data.resultado}}</p>

        <h3>Paso 2: Intervalo de aceptación</h3>
        <p><strong>Fórmula del límite inferior:</strong></p>
        <p>Límite Superior = χ²<sub>α/2,n-1</sub>/12(n-1)</p>
        <p><strong>Resultado límite inferior:</strong> {{data.limiteInferior}}</p>

        <p><strong>Fórmula del límite superior:</strong></p>
        <p>Límite Inferior = χ²<sub>1-α/2,n-1</sub>/12(n-1)</p>
        <p><strong>Resultado límite superior:</strong> {{data.limiteSuperior}}</p>

        <h3>Conclusión:</h3>
        <p>
          La varianza: {{data.resultado}} se encuentra dentro del rango
          [{{data.limiteInferior}} , {{data.limiteSuperior}}]
        </p>
        <ng-container *ngIf="data.resultado >= data.limiteInferior && data.resultado <= data.limiteSuperior; else fueraRango">
          <p style="color: green;"><strong>Se acepta la hipotesis H0.</strong></p>
        </ng-container>
        <ng-template #fueraRango>
          <p style="color: red;"><strong>Se acepta la hipotesis H1.</strong></p>
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

const chi2Table: { [gl: number]: { [p: number]: number } } = {
  1:  { 0.005: 0.000, 0.010: 0.000, 0.025: 0.001, 0.050: 0.004, 0.100: 0.016, 0.900: 2.706, 0.950: 3.841, 0.975: 5.024, 0.990: 6.635, 0.995: 7.879 },
  2:  { 0.005: 0.010, 0.010: 0.020, 0.025: 0.051, 0.050: 0.103, 0.100: 0.211, 0.900: 4.605, 0.950: 5.991, 0.975: 7.378, 0.990: 9.210, 0.995: 10.597 },
  3:  { 0.005: 0.072, 0.010: 0.115, 0.025: 0.216, 0.050: 0.352, 0.100: 0.584, 0.900: 6.251, 0.950: 7.815, 0.975: 9.348, 0.990: 11.345, 0.995: 12.838 },
  4:  { 0.005: 0.207, 0.010: 0.297, 0.025: 0.484, 0.050: 0.711, 0.100: 1.064, 0.900: 7.779, 0.950: 9.488, 0.975: 11.143, 0.990: 13.277, 0.995: 14.860 },
  5:  { 0.005: 0.412, 0.010: 0.554, 0.025: 0.831, 0.050: 1.145, 0.100: 1.610, 0.900: 9.236, 0.950: 11.070, 0.975: 12.833, 0.990: 15.086, 0.995: 16.750 },
  6:  { 0.005: 0.676, 0.010: 0.872, 0.025: 1.237, 0.050: 1.635, 0.100: 2.204, 0.900: 10.645, 0.950: 12.592, 0.975: 14.449, 0.990: 16.812, 0.995: 18.548 },
  7:  { 0.005: 0.989, 0.010: 1.239, 0.025: 1.690, 0.050: 2.167, 0.100: 2.833, 0.900: 12.017, 0.950: 14.067, 0.975: 16.013, 0.990: 18.475, 0.995: 20.278 },
  8:  { 0.005: 1.344, 0.010: 1.646, 0.025: 2.180, 0.050: 2.733, 0.100: 3.490, 0.900: 13.362, 0.950: 15.507, 0.975: 17.535, 0.990: 20.090, 0.995: 21.955 },
  9:  { 0.005: 1.735, 0.010: 2.088, 0.025: 2.700, 0.050: 3.325, 0.100: 4.168, 0.900: 14.684, 0.950: 16.919, 0.975: 19.023, 0.990: 21.666, 0.995: 23.589 },
  10: { 0.005: 2.156, 0.010: 2.558, 0.025: 3.247, 0.050: 3.940, 0.100: 4.865, 0.900: 15.987, 0.950: 18.307, 0.975: 20.483, 0.990: 23.209, 0.995: 25.188 },
  11: { 0.005: 2.603, 0.010: 3.053, 0.025: 3.816, 0.050: 4.575, 0.100: 5.578, 0.900: 17.275, 0.950: 19.675, 0.975: 21.920, 0.990: 24.725, 0.995: 26.757 },
  12: { 0.005: 3.074, 0.010: 3.571, 0.025: 4.404, 0.050: 5.226, 0.100: 6.304, 0.900: 18.549, 0.950: 21.026, 0.975: 23.337, 0.990: 26.217, 0.995: 28.300 },
  13: { 0.005: 3.565, 0.010: 4.107, 0.025: 5.009, 0.050: 5.892, 0.100: 7.042, 0.900: 19.812, 0.950: 22.362, 0.975: 24.736, 0.990: 27.688, 0.995: 29.819 },
  14: { 0.005: 4.075, 0.010: 4.660, 0.025: 5.629, 0.050: 6.571, 0.100: 7.790, 0.900: 21.064, 0.950: 23.685, 0.975: 26.119, 0.990: 29.141, 0.995: 31.319 },
  15: { 0.005: 4.601, 0.010: 5.229, 0.025: 6.262, 0.050: 7.261, 0.100: 8.547, 0.900: 22.307, 0.950: 24.996, 0.975: 27.488, 0.990: 30.578, 0.995: 32.801 },
  16: { 0.005: 5.142, 0.010: 5.812, 0.025: 6.908, 0.050: 7.962, 0.100: 9.312, 0.900: 23.542, 0.950: 26.296, 0.975: 28.845, 0.990: 32.000, 0.995: 34.267 },
  17: { 0.005: 5.697, 0.010: 6.408, 0.025: 7.564, 0.050: 8.672, 0.100: 10.085, 0.900: 24.769, 0.950: 27.587, 0.975: 30.191, 0.990: 33.409, 0.995: 35.718 },
  18: { 0.005: 6.265, 0.010: 7.015, 0.025: 8.231, 0.050: 9.390, 0.100: 10.865, 0.900: 25.989, 0.950: 28.869, 0.975: 31.526, 0.990: 34.805, 0.995: 37.156 },
  19: { 0.005: 6.844, 0.010: 7.633, 0.025: 8.907, 0.050: 10.117, 0.100: 11.651, 0.900: 27.204, 0.950: 30.144, 0.975: 32.852, 0.990: 36.191, 0.995: 38.582 },
  20: { 0.005: 7.434, 0.010: 8.260, 0.025: 9.591, 0.050: 10.851, 0.100: 12.443, 0.900: 28.412, 0.950: 31.410, 0.975: 34.170, 0.990: 37.566, 0.995: 39.997 },
  21: { 0.005: 8.034, 0.010: 8.897, 0.025: 10.283, 0.050: 11.591, 0.100: 13.240, 0.900: 29.615, 0.950: 32.671, 0.975: 35.479, 0.990: 38.932, 0.995: 41.401 },
  22: { 0.005: 8.643, 0.010: 9.542, 0.025: 10.982, 0.050: 12.338, 0.100: 14.041, 0.900: 30.813, 0.950: 33.924, 0.975: 36.781, 0.990: 40.289, 0.995: 42.796 },
  23: { 0.005: 9.260, 0.010: 10.196, 0.025: 11.689, 0.050: 13.091, 0.100: 14.848, 0.900: 32.007, 0.950: 35.172, 0.975: 38.076, 0.990: 41.638, 0.995: 44.181 },
  24: { 0.005: 9.886, 0.010: 10.856, 0.025: 12.401, 0.050: 13.848, 0.100: 15.659, 0.900: 33.196, 0.950: 36.415, 0.975: 39.364, 0.990: 42.980, 0.995: 45.558 },
  25: { 0.005: 10.520, 0.010: 11.524, 0.025: 13.120, 0.050: 14.611, 0.100: 16.473, 0.900: 34.382, 0.950: 37.652, 0.975: 40.646, 0.990: 44.314, 0.995: 46.928 },
  26: { 0.005: 11.160, 0.010: 12.198, 0.025: 13.844, 0.050: 15.379, 0.100: 17.292, 0.900: 35.563, 0.950: 38.885, 0.975: 41.923, 0.990: 45.642, 0.995: 48.290 },
  27: { 0.005: 11.808, 0.010: 12.879, 0.025: 14.573, 0.050: 16.151, 0.100: 18.114, 0.900: 36.741, 0.950: 40.113, 0.975: 43.195, 0.990: 46.963, 0.995: 49.645 },
  28: { 0.005: 12.461, 0.010: 13.565, 0.025: 15.308, 0.050: 16.928, 0.100: 18.939, 0.900: 37.916, 0.950: 41.337, 0.975: 44.461, 0.990: 48.278, 0.995: 50.993 },
  29: { 0.005: 13.121, 0.010: 14.256, 0.025: 16.047, 0.050: 17.708, 0.100: 19.768, 0.900: 39.087, 0.950: 42.557, 0.975: 45.722, 0.990: 49.588, 0.995: 52.336 },
  30: { 0.005: 13.787, 0.010: 14.953, 0.025: 16.791, 0.050: 18.493, 0.100: 20.599, 0.900: 40.256, 0.950: 43.773, 0.975: 46.979, 0.990: 50.892, 0.995: 53.672 },
  35: { 0.005: 16.266, 0.010: 17.724, 0.025: 20.278, 0.050: 22.465, 0.100: 24.533, 0.900: 45.722, 0.950: 49.802, 0.975: 53.540, 0.990: 57.153, 0.995: 60.391 },
  40: { 0.005: 18.730, 0.010: 20.483, 0.025: 23.654, 0.050: 26.509, 0.100: 28.412, 0.900: 51.805, 0.950: 55.758, 0.975: 60.391, 0.990: 63.691, 0.995: 67.505 },
  45: { 0.005: 21.190, 0.010: 23.230, 0.025: 28.360, 0.050: 30.578, 0.100: 32.357, 0.900: 57.505, 0.950: 61.656, 0.975: 65.410, 0.990: 70.201, 0.995: 74.221 },
  50: { 0.005: 23.642, 0.010: 25.957, 0.025: 31.550, 0.050: 34.764, 0.100: 36.191, 0.900: 63.167, 0.950: 67.505, 0.975: 74.221, 0.990: 76.154, 0.995: 80.077 }
};

function interpolateChi2(gl: number, p: number): number {
  if (!chi2Table[gl]) {
    alert(`No hay datos de chi-cuadrada para gl = ${gl}. Agrega ese valor a la tabla.`);
    throw new Error(`No hay datos de chi-cuadrada para gl = ${gl}`);
  }
  const probs = Object.keys(chi2Table[gl]).map(Number).sort((a, b) => a - b);
  if (chi2Table[gl][p]) return chi2Table[gl][p];
  let p1 = probs[0], p2 = probs[probs.length - 1];
  for (let i = 0; i < probs.length - 1; i++) {
    if (p > probs[i] && p < probs[i + 1]) {
      p1 = probs[i];
      p2 = probs[i + 1];
      break;
    }
  }
  const chi2_1 = chi2Table[gl][p1];
  const chi2_2 = chi2Table[gl][p2];
  return chi2_1 + (chi2_2 - chi2_1) * ((p - p1) / (p2 - p1));
}
