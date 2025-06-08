import { Component } from '@angular/core';
import { SkeletonCrearUserComponent } from '../skeleton-crear-user/skeleton-crear-user.component';
import { NavbarComponent } from '../../Shared/navbar/navbar.component';
@Component({
    selector: 'app-home-crear-user',
    imports: [NavbarComponent, SkeletonCrearUserComponent],
    templateUrl: './home-crear-user.component.html',
    styleUrl: './home-crear-user.component.css'
})
export class HomeCrearUserComponent {

}
