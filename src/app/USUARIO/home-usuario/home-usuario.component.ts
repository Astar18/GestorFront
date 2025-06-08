import { Component } from '@angular/core';
import { NavbarComponent } from '../../Shared/navbar/navbar.component';
import { SkeltonUsuarioComponent } from '../skelton-usuario/skelton-usuario.component';

@Component({
  selector: 'app-home-usuario',
  standalone: true,
  imports: [NavbarComponent, SkeltonUsuarioComponent],
  templateUrl: './home-usuario.component.html',
  styleUrl: './home-usuario.component.css'
})
export class HomeUsuarioComponent {

}
