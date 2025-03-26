import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-series',
  imports: [CommonModule,
    ReactiveFormsModule,FormsModule],
  templateUrl: './series.component.html',
  styleUrl: './series.component.css'
})
export class SeriesComponent {
  data: any[] = [];
  sortedData: any[] = [];
  selectedColumnIndex: number = 0; // Por defecto selecciona la primera columna
  decimalPlaces: number = 2;
  confidenceIndex: number = 0.5;

  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      alert('Por favor, selecciona un único archivo.');
      return;
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const binaryString: string = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(binaryString, { type: 'binary' });
      const firstSheetName: string = workbook.SheetNames[0];
      const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName];
      this.data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Actualizar datos ordenados
      this.updateSortedData();
    };
    reader.readAsBinaryString(target.files[0]);
  }

  updateSortedData() {
    if (this.data.length < 2 || this.selectedColumnIndex < 0 || this.selectedColumnIndex >= this.data[0].length) {
      alert('Índice de columna inválido.');
      this.sortedData = [];
      return;
    }

    // Mantener la columna "Valor" en el orden original de importación
    const columnIndex = this.selectedColumnIndex;
    this.sortedData = this.data
      .slice(1) // Ignorar el encabezado
      .map(row => row[columnIndex]) // Extraer la columna seleccionada
      .filter(value => !isNaN(parseFloat(value))) // Filtrar valores numéricos
      .map(value => parseFloat(value))
      .sort((a, b) => a - b); // Ordenar de menor a mayor
  }

  formatData(value: any): string {
    return parseFloat(value).toFixed(this.decimalPlaces);
  }
}
