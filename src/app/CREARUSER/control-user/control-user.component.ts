import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TabViewModule } from 'primeng/tabview';
import { CajaChicaRegistrosComponent } from './caja-chica-registros/caja-chica-registros.component';
import { CajaGeneralRegistrosComponent } from './caja-general-registros/caja-general-registros.component';
@Component({
  selector: 'app-control-user',
  imports: [TableModule, FormsModule, CommonModule,TabViewModule,CajaChicaRegistrosComponent,CajaGeneralRegistrosComponent],
  templateUrl: './control-user.component.html',
  styleUrls: ['./control-user.component.css']
})
export class ControlUserComponent implements OnInit {

  constructor() {}
  ngOnInit(): void {

  }
}
