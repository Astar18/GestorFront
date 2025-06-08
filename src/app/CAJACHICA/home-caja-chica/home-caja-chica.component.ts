import { Component } from '@angular/core';
import { NavbarComponent } from '../../Shared/navbar/navbar.component';
import { SkeletonCajaChicaComponent } from '../skeleton-caja-chica/skeleton-caja-chica.component';
@Component({
    selector: 'app-home-caja-chica',
    imports: [NavbarComponent, SkeletonCajaChicaComponent],
    templateUrl: './home-caja-chica.component.html',
    styleUrl: './home-caja-chica.component.css'
})
export class HomeCajaChicaComponent {

}
