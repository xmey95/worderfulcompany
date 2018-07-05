import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllsurveysComponent } from './allsurveys.component';

describe('AllsurveysComponent', () => {
  let component: AllsurveysComponent;
  let fixture: ComponentFixture<AllsurveysComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllsurveysComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllsurveysComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
