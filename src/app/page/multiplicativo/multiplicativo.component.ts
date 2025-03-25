import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-multiplicativo',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './multiplicativo.component.html',
  styleUrl: './multiplicativo.component.css'
})
export class MultiplicativoComponent {
  form: FormGroup;
  results: Array<{ iteration: number; operation: string; x: number; r: string }> = [];
  constants: { g: number; m: number; a: number } | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      seed: [null, [Validators.required, Validators.min(0)]],
      k: [null, [Validators.required, Validators.min(0)]],
      period: [null, [Validators.required, Validators.min(1)]],
      aOption: ['3+8k', [Validators.required]] // Default option for "a"
    });
  }

  calculate(): void {
    const { seed, k, period, aOption } = this.form.value;

    const g = Math.ceil(Math.log2(period)) + 2; // g = ln(p) / ln(2) + 2
    const m = Math.pow(2, g); // m = 2^g
    const a = aOption === '3+8k' ? 3 + 8 * k : 5 + 8 * k; // Selección de "a"
    let x = seed;
    this.constants = { g, m, a };
    this.results = [];

    for (let i = 0; i < period; i++) {
      const xNext = (a * x) % m; // Fórmula multiplicativa
      const r = (xNext / (m - 1)).toFixed(5); // Normalización: máximo 5 decimales
      this.results.push({
        iteration: i + 1,
        operation: `(${a} * ${x}) mod ${m}`,
        x: xNext,
        r: r
      });
      x = xNext;
    }
  }

  clear(): void {
    this.form.reset();
    this.results = [];
    this.constants = null;
  }
}

