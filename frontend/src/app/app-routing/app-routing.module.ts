import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home/home.component'
import { ManageUsersComponent } from '../manage-users/manage-users.component';
import { MyAbsencesComponent } from '../absence-section/my-absences/my-absences.component';
//import { PageNotFoundComponent } from './page-not-found.component';

const appRoutes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'users', component: ManageUsersComponent },
    { path: 'myabsences', component: MyAbsencesComponent },
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
