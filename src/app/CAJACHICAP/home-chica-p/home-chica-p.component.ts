import { Component } from '@angular/core';
import { NavbarComponent } from '../../Shared/navbar/navbar.component';
import { SkeletonChicaPComponent } from '../skeleton-chica-p/skeleton-chica-p.component';
@Component({
    selector: 'app-home-chica-p',
    imports: [NavbarComponent, SkeletonChicaPComponent],
    templateUrl: './home-chica-p.component.html',
    styleUrl: './home-chica-p.component.css'
})
export class HomeChicaPComponent {

}
