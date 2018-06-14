import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home/home.component'
import { UserListComponent } from '../user-list/user-list.component'
//import { PageNotFoundComponent } from './page-not-found.component';

const appRoutes: Routes = [
    { path: 'home', component: HomeComponent },
    { path: 'userlist', component: UserListComponent },
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
