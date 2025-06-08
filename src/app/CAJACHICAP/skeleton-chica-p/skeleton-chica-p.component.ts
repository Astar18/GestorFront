import { Component } from '@angular/core';
import { CajaChicaPComponent } from '../caja-chica-p/caja-chica-p.component';
import { TabsModule } from 'primeng/tabs';
@Component({
    selector: 'app-skeleton-chica-p',
    imports: [CajaChicaPComponent, TabsModule],
    templateUrl: './skeleton-chica-p.component.html',
    styleUrl: './skeleton-chica-p.component.css'
})
export class SkeletonChicaPComponent {

}
