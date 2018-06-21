import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarBodyComponent } from './sidebar-body.component';

describe('SidebarBodyComponent', () => {
  let component: SidebarBodyComponent;
  let fixture: ComponentFixture<SidebarBodyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SidebarBodyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarBodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
