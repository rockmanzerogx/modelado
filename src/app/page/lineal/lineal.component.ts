import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-lineal',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './lineal.component.html',
  styleUrl: './lineal.component.css'
})
export class LinealComponent {
  form: FormGroup;
  results: Array<{ iteration: number; operation: string; x: number; r: string }> = [];
  constants: { g: number; m: number; c: number; a: number } | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      seed: [null, [Validators.required, Validators.min(0)]],
      k: [null, [Validators.required, Validators.min(0)]],
      period: [null, [Validators.required, Validators.min(1)]]
    });
  }

  calculate(): void {
    const { seed, k, period } = this.form.value;

    const g = Math.ceil(Math.log2(period)); // g = ln(p) / ln(2)
    const m = Math.pow(2, g); // m = 2^g
    const c = this.findNearestPrime(m); // c = número primo más cercano a m
    const a = 1 + 4 * k; // a = 1 + 4k
    let x = seed;
    this.constants = { g, m, c, a };
    this.results = [];

    for (let i = 0; i < period; i++) {
      const xNext = (a * x + c) % m;
      const r = (xNext / (m - 1)).toFixed(5); // Ajuste: máximo 5 decimales en R_j
      this.results.push({
        iteration: i + 1,
        operation: `(${a} * ${x} + ${c}) mod ${m}`,
        x: xNext,
        r: r
      });
      x = xNext;
    }
  }

  findNearestPrime(num: number): number {
    const isPrime = (n: number) => {
      if (n < 2) return false;
      for (let i = 2; i <= Math.sqrt(n); i++) {
        if (n % i === 0) return false;
      }
      return true;
    };

    let lower = num;
    let upper = num;

    while (true) {
      if (isPrime(lower)) return lower;
      if (isPrime(upper)) return upper;
      lower--;
      upper++;
    }
  }

  clear(): void {
    this.form.reset();
    this.results = [];
    this.constants = null;
  }
}
