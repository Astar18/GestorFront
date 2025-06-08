import { Component } from '@angular/core';
import { MenuComponent } from "../menu/menu.component";

@Component({
    selector: 'app-skeleton-menu',
    imports: [MenuComponent],
    standalone: true,
    templateUrl: './skeleton-menu.component.html',
    styleUrl: './skeleton-menu.component.css'
})
export class SkeletonMenuComponent {

}
