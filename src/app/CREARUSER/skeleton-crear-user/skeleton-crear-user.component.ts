import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { EstadoUserComponent } from '../estado-user/estado-user.component';
import { CuentaUserComponent } from '../cuenta-user/cuenta-user.component';
import { PerfilUsuarioComponent } from '../perfil-usuario/perfil-usuario.component';
import { UsuarioSucursalesComponent } from '../usuario-sucursales/usuario-sucursales.component';
import { SucursalesComponent } from '../sucursales/sucursales.component';
import { ControlUserComponent } from '../control-user/control-user.component';
@Component({
    selector: 'app-skeleton-crear-user',
    imports: [TabsModule, EstadoUserComponent,ControlUserComponent, CuentaUserComponent, PerfilUsuarioComponent, UsuarioSucursalesComponent,SucursalesComponent],
    templateUrl: './skeleton-crear-user.component.html',
    styleUrl: './skeleton-crear-user.component.css'
})
export class SkeletonCrearUserComponent {

}
