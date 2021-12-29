import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuotaComponent } from './suota.component';

describe('SuotaComponent', () => {
  let component: SuotaComponent;
  let fixture: ComponentFixture<SuotaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuotaComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuotaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
