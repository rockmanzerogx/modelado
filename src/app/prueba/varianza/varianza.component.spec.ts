import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VarianzaComponent } from './varianza.component';

describe('VarianzaComponent', () => {
  let component: VarianzaComponent;
  let fixture: ComponentFixture<VarianzaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VarianzaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VarianzaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
