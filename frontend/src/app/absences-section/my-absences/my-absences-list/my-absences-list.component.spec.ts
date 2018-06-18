import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAbsencesListComponent } from './my-absences-list.component';

describe('MyAbsencesListComponent', () => {
  let component: MyAbsencesListComponent;
  let fixture: ComponentFixture<MyAbsencesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyAbsencesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyAbsencesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
