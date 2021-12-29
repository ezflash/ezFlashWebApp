import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BooterComponent } from './booter.component';

describe('BooterComponent', () => {
  let component: BooterComponent;
  let fixture: ComponentFixture<BooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BooterComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
