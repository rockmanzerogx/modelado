import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart, Legend, LinearScale, LineController, LineElement, PointElement, ScatterController, Title, Tooltip } from 'chart.js';
// REGISTRA LOS COMPONENTES NECESARIOS
Chart.register(LineController, LineElement,ScatterController, PointElement, LinearScale, Title, Tooltip, Legend);

@Component({
  selector: 'app-variablealeatoria1',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './variablealeatoria1.component.html',
  styleUrl: './variablealeatoria1.component.css'
})
export class Variablealeatoria1Component {
  x1: number = 0;
  x2: number = 0;
  x3: number = 0;
  y1: number = 0;
  y2: number = 0;
  y3: number = 0;

  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  private myChart: Chart | null = null;

  parseFraction(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.includes('/')) {
    const [num, denom] = value.split('/').map(Number);
    if (!isNaN(num) && !isNaN(denom) && denom !== 0) {
      return num / denom;
    }
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}
  generarGrafico() {
  const x1 = this.parseFraction(this.x1);
  const y1 = this.parseFraction(this.y1);
  const x2 = this.parseFraction(this.x2);
  const y2 = this.parseFraction(this.y2);
  const x3 = this.parseFraction(this.x3);
  const y3 = this.parseFraction(this.y3);

  const data = [
    { x: x1, y: y1 },
    { x: x2, y: y2 },
    { x: x3, y: y3 },
  ];

  // Calcular máximos y mínimos
  const xVals = [x1, x2, x3];
  const yVals = [y1, y2, y3];
  const xMax = Math.max(...xVals) + 2;
  const xMin = Math.min(...xVals);
  const yMax = Math.max(...yVals) + 2;
  const yMin = Math.min(...yVals);

  // Destruir el gráfico existente si ya existe
  if (this.myChart) {
    this.myChart.destroy();
  }

  const canvas = this.chartCanvas?.nativeElement;
  if (!canvas) return;

  this.myChart = new Chart(canvas, {
    type: 'line',
    data: {
      datasets: [{
        label: 'Datos ingresados',
      data: data,
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      fill: false,
      tension: 0, // Línea recta entre puntos
      pointRadius: 5, // Tamaño de los puntos
      showLine: true // Asegura que se muestre la línea
    }],
    },
    options: {
      scales: {
        x: { 
          type: 'linear', 
          title: { display: true, text: 'Eje X' },
          min: 0,
          max: xMax
        },
        y: { 
          type: 'linear', 
          title: { display: true, text: 'Eje Y' },
          min: 0,
          max: yMax
        },
      },
    },
  });
}
}