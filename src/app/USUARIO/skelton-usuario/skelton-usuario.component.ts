import { Component } from '@angular/core';
import { ComponentUsuarioComponent } from '../component-usuario/component-usuario.component';
import { TabViewModule } from 'primeng/tabview';
import { TablaUsuariosComponent } from '../tabla-usuarios/tabla-usuarios.component';
@Component({
  selector: 'app-skelton-usuario',
  standalone: true,
  imports: [ComponentUsuarioComponent,TabViewModule,TablaUsuariosComponent],
  templateUrl: './skelton-usuario.component.html',
  styleUrl: './skelton-usuario.component.css'
})
export class SkeltonUsuarioComponent {


}
