import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../Shared/navbar/navbar.component';
import { SkeletonGeneralPComponent } from '../skeleton-general-p/skeleton-general-p.component';
import { CommonModule } from '@angular/common';
@Component({
    selector: 'app-home-general-p',
    imports: [NavbarComponent, SkeletonGeneralPComponent,CommonModule],
    templateUrl: './home-general-p.component.html',
    styleUrl: './home-general-p.component.css'
})
export class HomeGeneralPComponent implements OnInit {
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
    if ( perfil === 1) {
      this.ControlPerfil = true;
    }else {
      this.ControlPerfil = false;
    }
  }

}
