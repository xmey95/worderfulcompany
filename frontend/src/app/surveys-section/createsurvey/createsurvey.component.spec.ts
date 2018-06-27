import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatesurveyComponent } from './createsurvey.component';

describe('CreatesurveyComponent', () => {
  let component: CreatesurveyComponent;
  let fixture: ComponentFixture<CreatesurveyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatesurveyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatesurveyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
