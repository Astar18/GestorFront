import { ArchivosComponent } from './archivos/archivos.component';
import { Routes } from '@angular/router';
import { NavbarComponent } from './Shared/navbar/navbar.component';
import { LoginComponent } from './Auths/login/login.component';
import { HomeMenuComponent } from './MENUGENERAL/home-menu/home-menu.component';
import { HomeCrearUserComponent } from './CREARUSER/home-crear-user/home-crear-user.component';
import { HomeCajaGenComponent } from './CAJAGENERAL/home-caja-gen/home-caja-gen.component';
import { HomeCajaChicaComponent } from './CAJACHICA/home-caja-chica/home-caja-chica.component';
import { HomeCajasComponent } from './CAJAS/home-cajas/home-cajas.component';
import { HomeChicaPComponent } from './CAJACHICAP/home-chica-p/home-chica-p.component';
import { AuthGuard } from './Services/Guards/auth.guard';
import { HomeGeneralPComponent } from './CAJAGENERALP/home-general-p/home-general-p.component';

export const routes: Routes = [
  {path:'nav',component:NavbarComponent},
  {path:'login',component:LoginComponent},
  {path:'usuario',component:HomeCrearUserComponent,canActivate: [AuthGuard]},
  {path:'menu',component:HomeMenuComponent,canActivate: [AuthGuard]},
  {path:'archivos',component:HomeCajasComponent,canActivate: [AuthGuard]},
  {path:'caja-c-prc',component:HomeChicaPComponent,canActivate: [AuthGuard]},
  {path:'caja-g-crg',component:HomeCajaGenComponent,canActivate: [AuthGuard]},
  {path:'caja-c-crg',component:HomeCajaChicaComponent,canActivate: [AuthGuard]},
  {path:'caja-g-prc',component:HomeGeneralPComponent,canActivate: [AuthGuard]},
  {path: '', redirectTo: 'menu', pathMatch: 'full'},

];
