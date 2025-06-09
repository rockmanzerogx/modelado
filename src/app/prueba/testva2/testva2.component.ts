import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Chart, Legend, LinearScale, LineController, LineElement, PointElement, ScatterController, Title, Tooltip } from 'chart.js';
// REGISTRA LOS COMPONENTES NECESARIOS
Chart.register(LineController, LineElement, ScatterController, PointElement, LinearScale, Title, Tooltip, Legend);

@Component({
  selector: 'app-testva2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './testva2.component.html',
  styleUrl: './testva2.component.css'
})
export class Testva2Component implements OnInit {

  numPares: number = 3; // valor por defecto
  puntos: {x: any, y: any}[] = [
    {x: '', y: ''},
    {x: '', y: ''},
    {x: '', y: ''},
    {x: '', y: ''},
    {x: '', y: ''}
  ];

  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  private myChart: Chart | null = null;

  ecuacionRecta: string = '';
  procesoRecta: string = '';
  ecuacionesRecta: string[] = [];
  procesosRecta: string[] = [];

  ngOnInit() {
    this.actualizarPuntos();
  }

  actualizarPuntos() {
    this.puntos = this.puntos.slice(0, this.numPares);
    while (this.puntos.length < this.numPares) {
      this.puntos.push({x: '', y: ''});
    }
  }

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
    const data = this.puntos.slice(0, this.numPares).map(p => ({
      x: this.parseFraction(p.x),
      y: this.parseFraction(p.y)
    }));

    // Calcular máximos y mínimos
    const xVals = data.map(p => p.x);
    const yVals = data.map(p => p.y);
    const xMax = Math.max(...xVals) + 2;
    const yMax = Math.max(...yVals) + 2;

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

    // Llama aquí para mostrar la ecuación y el proceso
    this.calcularEcuacionRecta();
  }

  private renderKatex() {
    if (window && (window as any).renderMathInElement) {
      (window as any).renderMathInElement(document.body, {
        delimiters: [
          {left: "\\[", right: "\\]", display: true},
          {left: "\\(", right: "\\)", display: false}
        ]
      });
    }
  }

  calcularEcuacionRecta() {
    this.ecuacionesRecta = [];
    this.procesosRecta = [];

    for (let i = 0; i < this.numPares - 1; i++) {
      const x1 = this.parseFraction(this.puntos[i].x);
      const y1 = this.parseFraction(this.puntos[i].y);
      const x2 = this.parseFraction(this.puntos[i + 1].x);
      const y2 = this.parseFraction(this.puntos[i + 1].y);

      let ecuacion = '';
      let proceso = '';

      if (x1 === x2) {
        ecuacion = `x = ${x1}`;
        proceso = `
          \\[
          \\text{Recta vertical: } x = ${x1} \\\\
          \\text{Integral: } \\int_0^x ${y1} \\, dt = ${y1}x \\\\
          \\text{Puntos críticos: } (${x1}, ${y1}), (${x2}, ${y2})
          \\]
        `;
      } else if (y1 === y2) {
        ecuacion = `y = ${y1}`;
        proceso = `
          \\[
          \\text{Recta horizontal: } y = ${y1} \\\\
          \\text{Integral: } \\int_0^x ${y1} \\, dt = ${y1}x \\\\
          \\text{Puntos críticos: } (${x1}, ${y1}), (${x2}, ${y2})
          \\]
        `;
      } else {
        const m = (y2 - y1) / (x2 - x1);
        const mStr = m % 1 === 0 ? m : m.toFixed(2);
        const x1Str = x1 % 1 === 0 ? x1 : x1.toFixed(2);
        const y1Str = y1 % 1 === 0 ? y1 : y1.toFixed(2);
        const xMin = Math.min(x1, x2);
        const xMax = Math.max(x1, x2);

        ecuacion = `y = \\frac{${y2} - ${y1}}{${x2} - ${x1}} (x - ${x1}) + ${y1}`;
        proceso = `
          \\[
          \\text{Ecuación general:}\\quad y = \\frac{${y2} - ${y1}}{${x2} - ${x1}} (x - ${x1}) + ${y1} \\\\
          \\text{Solución:}\\quad y = (${mStr})(x - ${x1Str}) + ${y1Str} \\\\
          \\text{Puntos críticos: } (${x1}, ${y1}),\\ (${x2}, ${y2}) \\\\
          ${xMin} \\leq x \\leq ${xMax}
          \\]
        `;
      }

      this.ecuacionesRecta.push(ecuacion);
      this.procesosRecta.push(proceso);
    }

    this.renderKatex();
  }
}