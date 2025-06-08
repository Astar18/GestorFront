import { Component } from '@angular/core';
import { NavbarComponent } from '../../Shared/navbar/navbar.component';
import { SkeletonCajaGenComponent } from '../skeleton-caja-gen/skeleton-caja-gen.component';


@Component({
    selector: 'app-home-caja-gen',
    standalone: true,
    imports: [ SkeletonCajaGenComponent,NavbarComponent],
    templateUrl: './home-caja-gen.component.html',
    styleUrl: './home-caja-gen.component.css'
})
export class HomeCajaGenComponent {

}
