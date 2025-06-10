import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../Shared/navbar/navbar.component';
import { SkeletonChicaPComponent } from '../skeleton-chica-p/skeleton-chica-p.component';
import { CommonModule } from '@angular/common';
@Component({
    selector: 'app-home-chica-p',
    imports: [NavbarComponent, SkeletonChicaPComponent,CommonModule],
    templateUrl: './home-chica-p.component.html',
    styleUrl: './home-chica-p.component.css'
})
export class HomeChicaPComponent implements OnInit {
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
