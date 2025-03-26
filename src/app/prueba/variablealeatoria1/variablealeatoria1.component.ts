import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-variablealeatoria1',
  imports: [FormsModule],
  templateUrl: './variablealeatoria1.component.html',
  styleUrl: './variablealeatoria1.component.css'
})
export class Variablealeatoria1Component {
  @Input() x1: number = 0;
  @Input() x2: number = 0;
  @Input() x3: number = 0;
  @Input() y1: number = 0;
  @Input() y2: number = 0;
  @Input() y3: number = 0;

  private myChart: Chart | null = null;

  generarGrafico() {
    const data = [
      { x: this.x1, y: this.y1 },
      { x: this.x2, y: this.y2 },
      { x: this.x3, y: this.y3 },
    ];

    // Destruir el gráfico existente si ya existe
    if (this.myChart) {
      this.myChart.destroy();
    }

    // Crear el nuevo gráfico
    this.myChart = new Chart('chart', {
      type: 'scatter',
      data: {
        datasets: [{
          label: 'Datos ingresados',
          data: data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }],
      },
      options: {
        scales: {
          x: { type: 'linear', title: { display: true, text: 'Eje X' } },
          y: { type: 'linear', title: { display: true, text: 'Eje Y' } },
        },
      },
    });
  }
}
