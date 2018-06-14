import { AppComponent } from './app.component';
import { AppRoutingModule }   from './app-routing/app-routing.module';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MiniSidebarItem, SidebarBodyComponent, SidebarMenuItem } from './sidebar-body/sidebar-body.component';
import { MatButtonModule,
         MatCardModule,
         MatDividerModule,
         MatFormFieldModule,
         MatInputModule,
         MatProgressSpinnerModule,
         MatTableModule
       } from '@angular/material';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component'
import { UserService } from './user.service';
import { UserListComponent } from './user-list/user-list.component';
import { UserTableComponent } from './user-table/user-table.component'

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MiniSidebarItem,
    SidebarBodyComponent,
    SidebarMenuItem,
    HeaderComponent,
    SidebarComponent,
    UserListComponent,
    UserTableComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTableModule
  ],
  providers: [UserService],
  bootstrap: [AppComponent]
})
export class AppModule { }
