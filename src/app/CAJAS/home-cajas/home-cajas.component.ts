import { Component } from '@angular/core';
import { SkeletonCajasComponent } from '../skeleton-cajas/skeleton-cajas.component';
import { NavbarComponent } from "../../Shared/navbar/navbar.component";
@Component({
    selector: 'app-home-cajas',
    imports: [ SkeletonCajasComponent, NavbarComponent],
    templateUrl: './home-cajas.component.html',
    styleUrl: './home-cajas.component.css'
})
export class HomeCajasComponent {

}
