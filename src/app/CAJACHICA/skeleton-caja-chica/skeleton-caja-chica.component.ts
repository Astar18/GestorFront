import { Component } from '@angular/core';
import { EstadoCajaChicaComponent } from '../estado-caja-chica/estado-caja-chica.component';
import { CajaChicaComponent } from '../caja-chica/caja-chica.component';
import { TabsModule } from 'primeng/tabs';
import { CommonModule } from '@angular/common';
@Component({
    selector: 'app-skeleton-caja-chica',
    imports: [ EstadoCajaChicaComponent, CajaChicaComponent,TabsModule,CommonModule],
    templateUrl: './skeleton-caja-chica.component.html',
    styleUrl: './skeleton-caja-chica.component.css'
})
export class SkeletonCajaChicaComponent {

}
