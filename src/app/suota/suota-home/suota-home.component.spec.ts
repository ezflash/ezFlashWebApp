import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuotaHomeComponent } from './suota-home.component';

describe('SuotaHomeComponent', () => {
  let component: SuotaHomeComponent;
  let fixture: ComponentFixture<SuotaHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuotaHomeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuotaHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
