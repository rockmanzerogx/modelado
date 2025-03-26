import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablanormalComponent } from './tablanormal.component';

describe('TablanormalComponent', () => {
  let component: TablanormalComponent;
  let fixture: ComponentFixture<TablanormalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablanormalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablanormalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
