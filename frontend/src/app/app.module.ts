import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing/app-routing.module";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule } from "@angular/platform-browser";
import { CalendarModule } from "angular-calendar";
import { FlexLayoutModule } from "@angular/flex-layout";
import { HomeComponent } from "./home/home.component";
import { HttpClientModule } from "@angular/common/http";
import { LOCALE_ID, NgModule } from "@angular/core";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MiniSidebarItem,
  SidebarBodyComponent,
  SidebarMenuItem
} from "./sidebar/sidebar-body/sidebar-body.component";
import {
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatNativeDateModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatStepperModule,
  MatTableModule
} from "@angular/material";
import { HeaderComponent } from "./header/header.component";
import { RequestsService } from "./absences-section/requests.service";
import { RequestsSurveysService } from "./surveys-section/requests.service";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { UserService } from "./user.service";
import { BlockScrollService } from "./block-scroll.service";
import {
  BottomListComponent,
  ManageUsersComponent
} from "./manage-users/manage-users.component";
import { UserTableComponent } from "./manage-users/user-table/user-table.component";
import { CookieService } from "ngx-cookie-service";
import { LoginDialogComponent } from "./login-dialog/login-dialog.component";

//Registers locale data to 'it' for date pipe format
import { registerLocaleData } from "@angular/common";
import localeIt from "@angular/common/locales/it";
import { MyAbsencesComponent } from "./absences-section/my-absences/my-absences.component";
import {
  ModifyRequestComponent,
  MyAbsencesListComponent
} from "./absences-section/my-absences/my-absences-list/my-absences-list.component";
import { EmployeesComponent } from "./absences-section/employees/employees.component";
import { RequestChartsComponent } from "./absences-section/request-charts/request-charts.component";
import { EmployeeComponent } from "./absences-section/employee/employee.component";
import {
  AbsencesCalendarComponent,
  RequestDetailsComponent
} from "./absences-section/absences-calendar/absences-calendar.component";
import {
  CreatesurveyComponent,
  ModifyQuestionComponent
} from "./surveys-section/createsurvey/createsurvey.component";
import { AllsurveysComponent } from "./surveys-section/allsurveys/allsurveys.component";
import { NgCircleProgressModule } from "ng-circle-progress";
import { CompileComponent } from "./surveys-section/compile/compile.component";
import { AdminComponent } from './surveys-section/admin/admin.component';
registerLocaleData(localeIt, "it");

@NgModule({
  declarations: [
    AppComponent,
    BottomListComponent,
    HomeComponent,
    MiniSidebarItem,
    SidebarBodyComponent,
    SidebarMenuItem,
    HeaderComponent,
    SidebarComponent,
    ManageUsersComponent,
    UserTableComponent,
    LoginDialogComponent,
    ModifyQuestionComponent,
    ModifyRequestComponent,
    MyAbsencesComponent,
    MyAbsencesListComponent,
    EmployeesComponent,
    RequestChartsComponent,
    RequestDetailsComponent,
    EmployeeComponent,
    AbsencesCalendarComponent,
    CreatesurveyComponent,
    AllsurveysComponent,
    CompileComponent,
    AdminComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    CalendarModule.forRoot(),
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatStepperModule,
    MatTableModule,
    MatDialogModule,
    NgxChartsModule,
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 200,
      outerStrokeWidth: 35,
      innerStrokeWidth: 26,
      outerStrokeColor: "#78C000",
      innerStrokeColor: "#C7E596",
      animationDuration: 300
    })
  ],
  providers: [
    { provide: LOCALE_ID, useValue: "it" },
    BlockScrollService,
    CookieService,
    RequestsService,
    RequestsSurveysService,
    UserService
  ],
  entryComponents: [
    BottomListComponent,
    ModifyRequestComponent,
    ModifyQuestionComponent,
    RequestDetailsComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
