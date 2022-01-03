import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExampleManagerComponent } from './example-manager.component';

describe('ExampleManagerComponent', () => {
  let component: ExampleManagerComponent;
  let fixture: ComponentFixture<ExampleManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExampleManagerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExampleManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
