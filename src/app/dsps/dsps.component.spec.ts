import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DspsComponent } from './dsps.component';

describe('DspsComponent', () => {
  let component: DspsComponent;
  let fixture: ComponentFixture<DspsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DspsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DspsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
