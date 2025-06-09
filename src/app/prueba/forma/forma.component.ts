import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as XLSX from 'xlsx';
import { Chi2Service } from '../../shared/chi2.service';

@Component({
  selector: 'app-forma',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './forma.component.html',
  styleUrl: './forma.component.css'
})
export class FormaComponent {
  datos: any[][] = [];
  columnaSeleccionada: number = 0;
  datosColumna: number[] = [];
  datosOrdenados: number[] = []; // <-- Agrega esto
  resultado: number | null = null;
  decimales: number = 4; // Inicialmente 4 decimales
  indiceConfianza: number = 0.94; // Índice de confianza predeterminado
  limiteSuperior: number | null = null;
  limiteInferior: number | null = null;
  alfaDiv2: number = 0; // α/2
  unoMenosAlfaDiv2: number = 0; // 1-α/2

  constructor(private dialog: MatDialog, private chi2Service: Chi2Service) {}

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

      // Obtén y guarda los datos ordenados de la columna seleccionada
      const datosNumericos = this.datos
        .map(fila => fila[this.columnaSeleccionada])
        .filter(valor => !isNaN(parseFloat(valor)) && valor !== undefined)
        .map(valor => parseFloat(valor));
      this.datosOrdenados = [...datosNumericos].sort((a, b) => a - b);
    };

    reader.readAsArrayBuffer(file);
  }

  actualizarColumna(): void {
    this.datosColumna = this.datos
      .map(fila => fila[this.columnaSeleccionada])
      .filter(valor => !isNaN(parseFloat(valor)) && valor !== undefined);
  }

  pruebaDeForma(): void {
    if (this.datosColumna.length > 1) {
      const N = this.datosColumna.length;
      const n = Math.round(Math.sqrt(N)); // Cantidad de intervalos
      const alfa = 1 - this.indiceConfianza;
      this.alfaDiv2 = parseFloat((alfa / 2).toFixed(4));
      this.unoMenosAlfaDiv2 = this.indiceConfianza; // <-- Cambiado aquí

      // 1. Definir los límites de los intervalos
      const intervalos: number[] = [];
      for (let i = 0; i <= n; i++) {
        intervalos.push(i / n);
      }

      // 2. Contar la frecuencia observada (FO) en cada intervalo
      const FO = new Array(n).fill(0);
      this.datosColumna.forEach(valor => {
        for (let i = 0; i < n; i++) {
          if (valor >= intervalos[i] && valor < intervalos[i + 1]) {
            FO[i]++;
            break;
          }
          // Incluir el valor 1 en el último intervalo
          if (i === n - 1 && valor === 1) {
            FO[i]++;
          }
        }
      });

      // 3. Calcular la frecuencia esperada (FE)
      const FE = N / n;

      // 4. Calcular el estadístico de prueba chi-cuadrada según la ecuación del cuadro de diálogo
      let chi2 = 0;
      for (let i = 0; i < n; i++) {
        chi2 += Math.pow(FO[i] - FE, 2) / FE;
      }
      this.resultado = parseFloat(chi2.toFixed(this.decimales));

      // 5. Calcular el estadístico teórico usando el servicio compartido
      const gl = n - 1;
      const chi2_teorico = this.chi2Service.interpolateChi2(gl, this.indiceConfianza); // <-- Cambiado aquí

      this.dialog.open(DialogContentExampleDialog, {
        data: {
          N,
          n,
          FO,
          FE,
          resultado: this.resultado,
          chi2_sup: chi2_teorico.toFixed(4),
          gl,
          alfaDiv2: this.alfaDiv2,
          unoMenosAlfaDiv2: this.indiceConfianza // <-- Cambiado aquí
        }
      });
    } else {
      alert("Se necesitan al menos dos datos para aplicar la prueba de forma.");
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
    <div class="dialog-container" [style.width]="data.n > 15 ? '95vw' : 'auto'">
      <h1 mat-dialog-title>Resultados</h1>
      <div mat-dialog-content>
        <h3>Hipótesis:</h3>
        <p><strong>H₀:</strong> Los #'s PA siguen una distribucion uniforme centralizada U[0-1]</p>
        <p><strong>H₁:</strong> Los #'s PA no siguen una distribucion uniforme centralizada U[0-1]</p>

        <h3>Datos:</h3>
        <p><strong>N (Cantidad de datos):</strong> {{data.N}}</p>
        <p><strong>n (número de intervalos, n = round(√N)):</strong> {{data.n}}</p>

        <h3>Frecuencias por intervalo</h3>
        <div style="overflow-x:auto;">
          <table border="1" style="min-width: 600px;">
            <thead>
              <tr>
                <th>Intervalo</th>
                <th *ngFor="let i of [].constructor(data.n); let idx = index">
                  {{ idx + 1 }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>FO</strong></td>
                <td *ngFor="let fo of data.FO">{{ fo }}</td>
              </tr>
              <tr>
                <td><strong>FE</strong></td>
                <td *ngFor="let fo of data.FO">{{ data.FE | number:'1.2-2' }}</td>
              </tr>
              <tr>
                <td><strong>(FO-FE)²/FE</strong></td>
                <td *ngFor="let fo of data.FO">
                  {{ ((fo - data.FE) * (fo - data.FE) / data.FE) | number:'1.4-4' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Paso 1: Calcular estadístico de prueba</h3>
        <p>
          <strong>Ecuación:</strong>
          χ² = Σ<sub>i=1</sub><sup>n</sup> ((FO<sub>i</sub> - FE<sub>i</sub>)² / FE<sub>i</sub>)
        </p>
        <p><strong>Resultado χ² (calculado):</strong> {{data.resultado}}</p>

        <h3>Paso 2: Estadístico teórico</h3>
        <p>
          <strong>χ²<sub>1-α, n-1</sub> (teórico):</strong> {{data.chi2_sup}}
          <br>
          <small>
            Calculado con índice de confianza = {{data.unoMenosAlfaDiv2}}, grados de libertad = {{data.n - 1}}
          </small>
        </p>

        <h3>Conclusión:</h3>
        <p>
          El estadístico χ² calculado: {{data.resultado}} se compara con el valor teórico χ²<sub>1-α, n-1</sub>: {{data.chi2_sup}}
        </p>
        <ng-container *ngIf="data.resultado <= data.chi2_sup; else fueraRango">
          <p style="color: green;"><strong>Se acepta la hipótesis H₀.</strong></p>
        </ng-container>
        <ng-template #fueraRango>
          <p style="color: red;"><strong>Se acepta la hipótesis H₁.</strong></p>
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
      max-width: 98vw;
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
    table {
      margin-bottom: 16px;
    }
    th, td {
      text-align: center;
      padding: 4px 8px;
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

