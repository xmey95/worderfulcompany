import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { HomeComponent } from "../home/home.component";
import { ManageUsersComponent } from "../manage-users/manage-users.component";
import { MyAbsencesComponent } from "../absences-section/my-absences/my-absences.component";
import { EmployeesComponent } from "../absences-section/employees/employees.component";
import { EmployeeComponent } from "../absences-section/employee/employee.component";
import { AbsencesCalendarComponent } from "../absences-section/absences-calendar/absences-calendar.component";
import { CreatesurveyComponent } from "../surveys-section/createsurvey/createsurvey.component";
import { AllsurveysComponent } from "../surveys-section/allsurveys/allsurveys.component";
import { CompileComponent } from "../surveys-section/compile/compile.component";
import { AdminComponent } from "../surveys-section/admin/admin.component";

const appRoutes: Routes = [
  { path: "absences/calendar", component: AbsencesCalendarComponent },
  { path: "absences/employees", component: EmployeesComponent },
  { path: "absences/employee", component: EmployeeComponent },
  { path: "home", component: HomeComponent },
  { path: "absences/myabsences", component: MyAbsencesComponent },
  { path: "surveys/createsurvey", component: CreatesurveyComponent },
  { path: "surveys/allsurveys", component: AllsurveysComponent },
  { path: "surveys/compile/:id/:recompile", component: CompileComponent },
  { path: "surveys/admin", component: AdminComponent },
  { path: "users", component: ManageUsersComponent },
  { path: "", redirectTo: "/home", pathMatch: "full" }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {
      enableTracing: false // <-- debugging purposes only
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
