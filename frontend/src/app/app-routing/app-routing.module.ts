import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home/home.component'
import { ManageUsersComponent } from '../manage-users/manage-users.component';
import { MyAbsencesComponent } from '../absences-section/my-absences/my-absences.component';
import { EmployeesComponent } from '../absences-section/employees/employees.component';
import { EmployeeComponent } from '../absences-section/employee/employee.component';
import { AbsencesCalendarComponent } from '../absences-section/absences-calendar/absences-calendar.component';
//import { PageNotFoundComponent } from './page-not-found.component';
const appRoutes: Routes = [
    { path: 'absences/calendar', component: AbsencesCalendarComponent },
    { path: 'absences/employees', component: EmployeesComponent },
    { path: 'absences/employee', component: EmployeeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'absences/myabsences', component: MyAbsencesComponent },
    { path: 'users', component: ManageUsersComponent },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
  /*  { path: '**', component: PageNotFoundComponent }*/
];


@NgModule({
    imports: [
        RouterModule.forRoot(
            appRoutes,
            {
                enableTracing: false // <-- debugging purposes only
            }
        )
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }
