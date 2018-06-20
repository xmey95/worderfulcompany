import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsencesCalendarComponent } from './absences-calendar.component';

describe('AbsencesCalendarComponent', () => {
  let component: AbsencesCalendarComponent;
  let fixture: ComponentFixture<AbsencesCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AbsencesCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AbsencesCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
