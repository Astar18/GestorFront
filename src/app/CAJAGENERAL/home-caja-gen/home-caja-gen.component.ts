import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../Shared/navbar/navbar.component';
import { SkeletonCajaGenComponent } from '../skeleton-caja-gen/skeleton-caja-gen.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-home-caja-gen',
    standalone: true,
    imports: [ SkeletonCajaGenComponent,NavbarComponent, CommonModule ],
    templateUrl: './home-caja-gen.component.html',
    styleUrl: './home-caja-gen.component.css'
})
export class HomeCajaGenComponent implements OnInit {
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
