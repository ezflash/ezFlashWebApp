import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleHomeComponent } from './example-home.component';

describe('ExampleHomeComponent', () => {
  let component: ExampleHomeComponent;
  let fixture: ComponentFixture<ExampleHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExampleHomeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
