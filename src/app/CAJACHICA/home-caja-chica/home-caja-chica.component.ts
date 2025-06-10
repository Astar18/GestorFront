import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../Shared/navbar/navbar.component';
import { SkeletonCajaChicaComponent } from '../skeleton-caja-chica/skeleton-caja-chica.component';
import { CommonModule } from '@angular/common';
@Component({
    selector: 'app-home-caja-chica',
    imports: [NavbarComponent, SkeletonCajaChicaComponent, CommonModule],
    templateUrl: './home-caja-chica.component.html',
    styleUrl: './home-caja-chica.component.css'
})
export class HomeCajaChicaComponent implements OnInit {

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
    if (perfil === 5 || perfil === 1) {
      this.ControlPerfil = false;
    }else {
      this.ControlPerfil = true;
    }
  }

}
