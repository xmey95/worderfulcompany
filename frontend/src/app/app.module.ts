import { AppComponent } from './app.component';
import { AppRoutingModule }   from './app-routing/app-routing.module';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MiniSidebarItem, SidebarBodyComponent, SidebarMenuItem } from './sidebar-body/sidebar-body.component';
import { MatBottomSheetModule,
         MatButtonModule,
         MatCardModule,
         MatDatepickerModule,
         MatDialogModule,
         MatDividerModule,
         MatFormFieldModule,
         MatInputModule,
         MatListModule,
         MatNativeDateModule,
         MatProgressSpinnerModule,
         MatSelectModule,
         MatSnackBarModule,
         MatTableModule,
       } from '@angular/material';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component'
import { UserService, ConfirmComponent } from './user.service';
import { BlockScrollService } from './block-scroll.service';
import { BottomListComponent, ManageUsersComponent } from './manage-users/manage-users.component';
import { UserTableComponent } from './user-table/user-table.component';
import { CookieService } from 'ngx-cookie-service';
import { LoginDialogComponent } from './login-dialog/login-dialog.component';

//Registers locale data to 'it' for date pipe format
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { MyAbsencesComponent } from './absence-section/my-absences/my-absences.component';
registerLocaleData(localeIt, 'it');

@NgModule({
  declarations: [
    AppComponent,
    BottomListComponent,
    ConfirmComponent,
    HomeComponent,
    MiniSidebarItem,
    SidebarBodyComponent,
    SidebarMenuItem,
    HeaderComponent,
    SidebarComponent,
    ManageUsersComponent,
    UserTableComponent,
    LoginDialogComponent,
    MyAbsencesComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSnackBarModule,
    MatTableModule,
    MatDialogModule
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'it' }, BlockScrollService, CookieService, UserService],
  entryComponents: [BottomListComponent, ConfirmComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
