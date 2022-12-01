import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlasherHomeComponent } from './flasher-home.component';

describe('FlasherHomeComponent', () => {
  let component: FlasherHomeComponent;
  let fixture: ComponentFixture<FlasherHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlasherHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlasherHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
