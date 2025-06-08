import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CajaChicaDTO, UsuarioService } from '../../../Services/USER/Usuario.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-caja-chica-registros',
  imports: [TableModule,CommonModule],
  templateUrl: './caja-chica-registros.component.html',
  styleUrl: './caja-chica-registros.component.css'
})
export class CajaChicaRegistrosComponent implements OnInit {
  cajaChicaData: CajaChicaDTO[] = [];
    totalRecords: number = 0;
    loading: boolean = false;
    filtro: string = '';
    pageChica: number = 1;
  pageGeneral: number = 1;
  firstChica: number = 0;
  firstGeneral: number = 0;

    page: number = 1;
    pageSize: number = 10;

  totalCajaGeneral: number = 0;




  constructor(private usuarioService: UsuarioService) {}
  ngOnInit(): void {
    this.cargarDatos();

  }
  cargarDatos(): void {
    this.loading = true;
    this.usuarioService.obtenerCajaChicaConEstado({
      estado: this.filtro,
      page: this.pageChica,
      pageSize: this.pageSize
    }).subscribe(res => {
      this.cajaChicaData = res.data;
      this.totalRecords = res.total;
      this.loading = false;
    });
  }
  onPageChangeChica(event: any) {
    this.pageSize = event.rows;
    this.pageChica = event.page + 1;  // PrimeNG comienza desde 0
    this.cargarDatos();
  }
}
