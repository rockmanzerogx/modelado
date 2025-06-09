import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Testva2Component } from './testva2.component';

describe('Testva2Component', () => {
  let component: Testva2Component;
  let fixture: ComponentFixture<Testva2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Testva2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Testva2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
