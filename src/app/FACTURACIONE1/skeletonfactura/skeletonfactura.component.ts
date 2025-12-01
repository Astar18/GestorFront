import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { ListarFacturaComponent } from '../listar-factura/listar-factura.component';
import { ClienteDetalleComponent } from '../cliente-detalle/cliente-detalle.component';
import { AreaComponent } from '../area/area.component';


@Component({
  selector: 'app-skeletonfactura',
  imports: [TabsModule,AreaComponent, ListarFacturaComponent, ClienteDetalleComponent],
  templateUrl: './skeletonfactura.component.html',
  styleUrl: './skeletonfactura.component.css',
})
export class SkeletonfacturaComponent {

}
