import { Component, OnInit } from '@angular/core';
import { SkeletonCrearUserComponent } from '../skeleton-crear-user/skeleton-crear-user.component';
import { NavbarComponent } from '../../Shared/navbar/navbar.component';
import { CommonModule } from '@angular/common';
@Component({
    selector: 'app-home-crear-user',
    imports: [NavbarComponent, SkeletonCrearUserComponent,CommonModule],
    templateUrl: './home-crear-user.component.html',
    styleUrl: './home-crear-user.component.css'
})
export class HomeCrearUserComponent implements OnInit {
  ControlPerfil: boolean = true;
  ngOnInit(): void {
    this.validacionPerfil();

  }
  validacionPerfil() {

    const perfilStr = sessionStorage.getItem('perfilId');
    console.log(perfilStr);
    console.log(typeof perfilStr);
    const perfil = perfilStr !== null ? Number(perfilStr) : null;
    console.log(perfil);
    if (perfil === 5) {
      this.ControlPerfil = false;
    }else {
      this.ControlPerfil = true;
    }
  }
}
