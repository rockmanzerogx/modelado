import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-tablanormal',
  imports: [ReactiveFormsModule, CommonModule,FormsModule],
  templateUrl: './tablanormal.component.html',
  styleUrl: './tablanormal.component.css'
})
export class TablaNormalComponent {
  // Columnas desde 0.00 a 0.09
  columns = ['0.00', '0.01', '0.02', '0.03', '0.04', '0.05', '0.06', '0.07', '0.08', '0.09'];

  // Datos de la tabla con valores de Z y probabilidades calculadas
  tableData = [
    { zValue: '-3.5', values: [0.0001, 0.0001, 0.0002, 0.0002, 0.0003, 0.0003, 0.0004, 0.0004, 0.0005, 0.0005] },
    { zValue: '-3.4', values: [0.0007, 0.0008, 0.0009, 0.0010, 0.0011, 0.0012, 0.0013, 0.0014, 0.0015, 0.0016] },
    { zValue: '-3.3', values: [0.0018, 0.0020, 0.0022, 0.0024, 0.0026, 0.0028, 0.0030, 0.0032, 0.0034, 0.0036] },
    { zValue: '-3.2', values: [0.0038, 0.0041, 0.0043, 0.0046, 0.0049, 0.0052, 0.0055, 0.0058, 0.0061, 0.0064] },
    // Añadir el resto de los valores desde -3.1 hasta 3.5
    { zValue: '3.5', values: [0.9994, 0.9995, 0.9996, 0.9997, 0.9998, 0.9998, 0.9999, 0.9999, 1.0000, 1.0000] }
  ];
}
