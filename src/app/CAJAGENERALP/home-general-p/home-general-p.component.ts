import { Component } from '@angular/core';
import { NavbarComponent } from '../../Shared/navbar/navbar.component';
import { SkeletonGeneralPComponent } from '../skeleton-general-p/skeleton-general-p.component';

@Component({
    selector: 'app-home-general-p',
    imports: [NavbarComponent, SkeletonGeneralPComponent],
    templateUrl: './home-general-p.component.html',
    styleUrl: './home-general-p.component.css'
})
export class HomeGeneralPComponent {

}
