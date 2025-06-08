import { Component } from '@angular/core';
import { SkeletonMenuComponent } from "../skeleton-menu/skeleton-menu.component";
import { NavbarComponent } from '../../Shared/navbar/navbar.component';
@Component({
    selector: 'app-home-menu',
    standalone: true,
    imports: [ SkeletonMenuComponent,NavbarComponent],
    templateUrl: './home-menu.component.html',
    styleUrl: './home-menu.component.css'
})
export class HomeMenuComponent {

}
