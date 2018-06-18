import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestChartsComponent } from './request-charts.component';

describe('RequestChartsComponent', () => {
  let component: RequestChartsComponent;
  let fixture: ComponentFixture<RequestChartsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestChartsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestChartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
