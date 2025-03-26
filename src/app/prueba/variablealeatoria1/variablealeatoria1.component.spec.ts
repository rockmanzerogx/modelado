import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Variablealeatoria1Component } from './variablealeatoria1.component';

describe('Variablealeatoria1Component', () => {
  let component: Variablealeatoria1Component;
  let fixture: ComponentFixture<Variablealeatoria1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Variablealeatoria1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Variablealeatoria1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
