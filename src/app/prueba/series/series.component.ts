import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as XLSX from 'xlsx';
// Asegúrate de tener un servicio Chi2Service que tenga el método getChi2(p, gl)
import { Chi2Service } from '../../shared/chi2.service';

@Component({
  selector: 'app-series',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './series.component.html',
  styleUrl: './series.component.css'
})
export class SeriesComponent {
  datos: any[][] = [];
  columnaSeleccionada: number = 0;
  datosColumna: number[] = [];
  resultado: number | null = null;
  decimales: number = 4;
  indiceConfianza: number = 0.95;
  limiteSuperior: number | null = null;
  limiteInferior: number | null = null;
  alfaDiv2: number = 0;
  unoMenosAlfaDiv2: number = 0;
  paresOrdenados: [number, number][] = [];

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
    };

    reader.readAsArrayBuffer(file);
  }

  actualizarColumna(): void {
    this.datosColumna = this.datos
      .map(fila => fila[this.columnaSeleccionada])
      .filter(valor => !isNaN(parseFloat(valor)) && valor !== undefined);

    // Generar pares ordenados: (x1, x2), (x2, x3), ..., (xn-1, xn)
    this.paresOrdenados = [];
    for (let i = 0; i < this.datosColumna.length - 1; i++) {
      this.paresOrdenados.push([this.datosColumna[i], this.datosColumna[i + 1]]);
    }
  }

  pruebaDeSeries(): void {
    if (this.datosColumna.length > 1) {
      const n = this.datosColumna.length;
      let m = Math.round(Math.sqrt(n));
      // Si m es impar, subir al siguiente número par
      if (m % 2 !== 0) {
        m++;
      }
      const matrizSize = m / 2;

      // 1. Formar los pares sucesivos (x1,x2), (x2,x3), ..., (xn-1,xn)
      const pares: [number, number][] = [];
      for (let i = 0; i < n - 1; i++) {
        pares.push([this.datosColumna[i], this.datosColumna[i + 1]]);
      }

      // 2. Inicializar matriz de frecuencias observadas FO_ij de tamaño (m/2) x (m/2)
      const FO: number[][] = Array.from({ length: matrizSize }, () => Array(matrizSize).fill(0));

      // 3. Contar cuántos pares caen en cada subcuadrante según los rangos
      pares.forEach(([x, y]) => {
        // Calcula el índice de fila y columna según el rango del cuadrante
        let i = Math.floor(x * matrizSize);
        let j = Math.floor(y * matrizSize);
        // Asegura que los índices no se salgan del rango
        if (i >= matrizSize) i = matrizSize - 1;
        if (j >= matrizSize) j = matrizSize - 1;
        FO[i][j]++;
      });

      // 4. Calcular frecuencia esperada FE
      const totalPares = pares.length;
      const FE = totalPares / (matrizSize * matrizSize);

      // 5. Calcular estadístico chi-cuadrada
      let chi2 = 0;
      for (let i = 0; i < matrizSize; i++) {
        for (let j = 0; j < matrizSize; j++) {
          chi2 += Math.pow(FO[i][j] - FE, 2) / FE;
        }
      }
      this.resultado = parseFloat(chi2.toFixed(this.decimales));

      // 6. Calcular grados de libertad
      const gl = matrizSize * matrizSize - 1;

      // 7. Calcular chi-cuadrado teórico usando el servicio
      const chi2Teorico = this.chi2Service.interpolateChi2(gl,this.indiceConfianza);

      // 8. Abrir el cuadro de diálogo con los resultados
      this.dialog.open(DialogContentExampleDialog, {
        data: {
          n,
          m: matrizSize,
          totalPares,
          FO,
          FE,
          resultado: this.resultado,
          gl,
          chi2Teorico,
          indiceConfianza: this.indiceConfianza
        }
      });
    } else {
      alert("Se necesitan al menos dos datos para aplicar la prueba de series.");
    }
  }
}

@Component({
  selector: 'dialog-content-example-dialog',
  imports: [CommonModule],
  template: `
    <div class="dialog-container" [style.width]="data.m > 10 ? '95vw' : 'auto'">
      <h1 mat-dialog-title>Resultados P. de Series</h1>
      <div mat-dialog-content>
        <h3>Hipótesis:</h3>
        <p><strong>H₀:</strong> Los pares (x₁,x₂), (x₃,x₄), ... son independientes y uniformes</p>
        <p><strong>H₁:</strong> No son independientes o no son uniformes</p>

        <h3>Datos:</h3>
        <strong>Cantidad de pares (n-1):</strong> {{data.n - 1}}
        <h3>Matriz de frecuencias observadas (FO)</h3>
        <div style="overflow-x:auto;">
          <table border="1">
            <thead>
              <tr>
                <th></th>
                <th *ngFor="let j of [].constructor(data.m); let col = index">
                  {{ (col/data.m) | number:'1.2-2' }} - {{ ((col+1)/data.m) | number:'1.2-2' }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let fila of data.FO; let i = index">
                <td>
                  <strong>
                    {{ (i/data.m) | number:'1.2-2' }} - {{ ((i+1)/data.m) | number:'1.2-2' }}
                  </strong>
                </td>
                <td *ngFor="let valor of fila">{{ valor }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Estadístico de prueba</h3>
        <p>
          <strong>Ecuación:</strong>
          χ² = Σ<sub>i=1</sub><sup>m</sup> Σ<sub>j=1</sub><sup>m</sup> (FO<sub>ij</sub> - FE)² / FE
        </p>
        <p><strong>Frecuencia esperada (FE):</strong> {{data.FE | number:'1.4-4'}}</p>
        <p><strong>χ² (calculado):</strong> {{data.resultado}}</p>
        
        <p><strong>χ² (teórico) (p={{data.indiceConfianza}}):</strong> {{data.chi2Teorico | number:'1.4-4'}}</p>
        <p><strong>Índice de confianza:</strong> {{data.indiceConfianza}} 
        <strong>Grados de libertad:</strong> {{data.gl}}</p>
        

        <h3>Conclusión:</h3>
        <p *ngIf="data.resultado < data.chi2Teorico" style="color: green;">
          χ² (calculado) &lt; χ² (teórico): <strong>Se acepta H₀</strong>.<br>
          Los pares parecen independientes y uniformes.
        </p>
        <p *ngIf="data.resultado >= data.chi2Teorico" style="color: red;">
          χ² (calculado) ≥ χ² (teórico): <strong>Se rechaza H₀</strong>.<br>
          Los pares no parecen independientes o uniformes.
        </p>
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
    @Inject(MAT_DIALOG_DATA) public data: {
      n: number,
      m: number,
      totalPares: number,
      FO: number[][],
      FE: number,
      resultado: number,
      gl: number,
      chi2Teorico: number,
      indiceConfianza: number
    },
    private dialogRef: MatDialogRef<DialogContentExampleDialog>
  
  ) {}
  cerrar() {
    this.dialogRef.close();
  }
}
