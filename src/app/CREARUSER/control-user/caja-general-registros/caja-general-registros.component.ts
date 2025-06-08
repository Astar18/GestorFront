import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CajaGeneralDTO, UsuarioService } from '../../../Services/USER/Usuario.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-caja-general-registros',
  imports: [TableModule,CommonModule],
  templateUrl: './caja-general-registros.component.html',
  styleUrl: './caja-general-registros.component.css'
})
export class CajaGeneralRegistrosComponent implements OnInit {
    totalRecords: number = 0;
    loading: boolean = false;
    filtro: string = '';
    pageChica: number = 1;
  pageGeneral: number = 1;
  firstChica: number = 0;
  firstGeneral: number = 0;

    // page: number = 1;
    pageSize: number = 10;
    cajaGeneralData: CajaGeneralDTO[] = [];
  totalCajaGeneral: number = 0;
  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.cargarCajaGeneral(this.pageGeneral, this.pageSize);

  }
  cargarCajaGeneral(page: number, size: number): void {
    this.loading = true;
    console.log('CajaGeneralRegistrosComponent: Solicitando datos para page:', page, 'y pageSize:', size, 'con filtro:', this.filtro);

    this.usuarioService.obtenerCajaGeneralConEstado({
      estado: this.filtro,
      page: page, // Use the passed 'page' argument
      pageSize: size // Use the passed 'size' argument
    }).subscribe(res => {
      this.cajaGeneralData = res.data.map(item => ({
        ...item,
        fechaCreacion: new Date(item.fechaCreacion),
        fechaUltimoCambio: item.fechaUltimoCambio ? new Date(item.fechaUltimoCambio).toISOString() : ''
      }));
      this.totalCajaGeneral = res.totalItems;
      this.loading = false;
      console.log('CajaGeneralRegistrosComponent: Respuesta del backend - pageNumber:', res.pageNumber, 'pageSize:', res.pageSize);
    }, error => {
      console.error('Error al cargar la caja general:', error);
      this.loading = false;
    });
  }


  onPageChangeGeneral(event: any) {
    this.firstGeneral = event.first;
    this.pageSize = event.rows;
    this.pageGeneral = (event.page ?? 0) + 1; // This updates pageGeneral correctly
    const newPage = (event.page ?? 0) + 1;
    this.pageGeneral = newPage;
    this.cargarCajaGeneral(newPage, this.pageSize); // This calls the loading method
  }


  aplicarFiltro() {
    this.pageGeneral = 1; // Reset to first page when applying filter
    this.firstGeneral = 0; // Reset first to 0 as well
    this.cargarCajaGeneral(1, this.pageSize);
  }

}
