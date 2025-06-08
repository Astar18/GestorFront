import { Component } from '@angular/core';
import { CajaGeneralPComponent } from '../caja-general-p/caja-general-p.component';
import { TabsModule } from 'primeng/tabs';
import { TabViewModule } from 'primeng/tabview';
@Component({
    selector: 'app-skeleton-general-p',
    imports: [CajaGeneralPComponent, TabsModule],
    templateUrl: './skeleton-general-p.component.html',
    styleUrl: './skeleton-general-p.component.css'
})
export class SkeletonGeneralPComponent {

}
