import { MessageService } from 'primeng/api';
import { CajaChica, CajaChicaService,CajaChicaFiltroDto } from './../../Services/CajaChica/caja-chica.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
@Component({
    selector: 'app-estado-caja-chica',
    imports: [TableModule, CommonModule,ToastModule,FormsModule,CalendarModule,InputTextModule],
    templateUrl: './estado-caja-chica.component.html',
    styleUrl: './estado-caja-chica.component.css',
    providers:[MessageService]
})
export class EstadoCajaChicaComponent implements OnInit, OnDestroy {
  documentosConRuta: CajaChica[] = [];
  selectedOption: any;

  filtros: any = {
    numeroComprobante: '',
    documentoNombre: '',
    fechaInicio: null,
    comentario: '',
    comentarioCargador: '',
    estado: ''
  };

  private filtroChanged: Subject<void> = new Subject<void>();
  private filtroSubscription!: Subscription;

  constructor(
    private cajaChicaService: CajaChicaService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.filtroSubscription = this.filtroChanged.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.cargarCajaChicaFiltrada();
    });

    this.cargarCajaChicaFiltrada();
  }

  ngOnDestroy() {
    this.filtroSubscription.unsubscribe();
  }

  onFiltroInput() {
    this.filtroChanged.next();
  }

  cargarCajaChicaFiltrada() {
    const sucursalId = Number(sessionStorage.getItem('sucursal'));

    const filtro: CajaChicaFiltroDto = {
      sucursalId: sucursalId,
      numeroComprobante: this.filtros.numeroComprobante,
      documentoNombre: this.filtros.documentoNombre,
      comentario: this.filtros.comentario,
      comentarioCargador: this.filtros.comentarioCargador,
      estado: this.filtros.estado,
      fechaInicio: this.filtros.fechaInicio
        ? new Date(this.filtros.fechaInicio).toISOString().split('T')[0]
        : undefined
    };

    this.cajaChicaService.obtenerCajaChicaFiltrado(filtro).subscribe({
      next: (respuesta) => {
        this.documentosConRuta = respuesta.datos;
      },
      error: (error) => {
        console.error('Error al cargar caja chica filtrada', error);
      }
    });
  }
}
