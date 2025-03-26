import { Routes } from '@angular/router';
import { NavbarComponent } from './Shared/navbar/navbar.component';
import { LoginComponent } from './Auths/login/login.component';

export const routes: Routes = [
  {path:'nav',component:NavbarComponent},
  {path:'login',component:LoginComponent},
  {path: '', redirectTo: 'home', pathMatch: 'full'},

];
