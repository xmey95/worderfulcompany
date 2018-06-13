import { AppComponent } from './app.component';
import { AppRoutingModule }   from './app-routing/app-routing.module';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { HomeComponent } from './home/home.component';
import { NgModule } from '@angular/core';
import { MiniSidebarItem, SidebarBodyComponent, SidebarMenuItem } from './sidebar-body/sidebar-body.component';
import { MatCardModule, MatDividerModule, MatIconModule, MatTreeModule } from '@angular/material'
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MiniSidebarItem,
    SidebarBodyComponent,
    SidebarMenuItem
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule, AppRoutingModule,MatCardModule, MatIconModule, MatDividerModule, MatTreeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
