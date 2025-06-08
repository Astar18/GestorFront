import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { EstadoGeneralComponent } from '../estado-general/estado-general.component';
import { CajaGeneralComponent } from '../caja-general/caja-general.component';
@Component({
    selector: 'app-skeleton-caja-gen',
    standalone: true,
    imports: [TabsModule, CajaGeneralComponent,EstadoGeneralComponent],
    templateUrl: './skeleton-caja-gen.component.html',
    styleUrl: './skeleton-caja-gen.component.css'
})
export class SkeletonCajaGenComponent {

}
