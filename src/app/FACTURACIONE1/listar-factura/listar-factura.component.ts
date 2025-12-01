import { Component, OnInit, inject, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Imports
import { TableModule, TableLazyLoadEvent, Table } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';

// Services & RxJS
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { 
  FacturasService, 
  FacturaDto, 
  FiltroFacturaRequest,
  CambioEstadoRequest
} from '../../Services/FacturaE1/facturas.service';
import { GestionFacturaComponent } from '../gestion-factura/gestion-factura.component';

@Component({
  selector: 'app-listar-factura',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ToolbarModule,
    ConfirmDialogModule,
    TagModule,
    SelectModule,
    DatePickerModule,
    GestionFacturaComponent
  ],
  templateUrl: './listar-factura.component.html',
  styleUrl: './listar-factura.component.css',
  providers: [MessageService, ConfirmationService]
})
export class ListarFacturaComponent implements OnInit, OnDestroy {
  
  private readonly facturaService = inject(FacturasService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);
  
  @ViewChild('dt') dt: Table | undefined;

  // --- VARIABLES DE ESTADO ---
  facturas: FacturaDto[] = [];
  totalRecords: number = 0;
  loading: boolean = true;
  rows: number = 10;
  currentPage: number = 1;

  // Filtros locales
  filtros: any = {
    numero: '',
    proveedorNombre: '',
    areaNombre: '',
    estado: null,
    fechaEmisionDesde: null,
    fechaEmisionHasta: null
  };

  // RxJS Debounce
  private readonly filterSubject = new Subject<{ field: string, value: any }>();
  private filterSubscription: Subscription | undefined;

  // Modal de cambio de estado
  estadoDialog: boolean = false;
  facturaSeleccionada: FacturaDto | null = null;
  nuevoEstado: string = '';
  comentarioEstado: string = '';

  // Modal de gestión de factura (crear/editar/ver)
  gestionDialog: boolean = false;
  modoGestion: 'crear' | 'editar' | 'detalle' = 'crear';
  facturaIdSeleccionada: number | null = null;

  // --- OPCIONES PARA SELECTS ---
  estadoOptions = [
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'Aprobada', value: 'Aprobada' },
    { label: 'Rechazada', value: 'Rechazada' },
    { label: 'Pagada', value: 'Pagada' },
    { label: 'Anulada', value: 'Anulada' }
  ];

  estadoFilterOptions = [
    { label: 'Todos', value: null },
    ...this.estadoOptions
  ];

  ngOnInit() {
    this.loading = true;

    // Configuración del Debounce (500ms)
    this.filterSubscription = this.filterSubject.pipe(
      debounceTime(500)
    ).subscribe((data) => {
      this.filtros[data.field] = data.value;
      if (this.dt) {
        this.dt.reset();
      }
    });
  }

  ngOnDestroy() {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
  }

  onFilterInput(event: any, field: string) {
    let value: any = null;

    if (event.target) {
      value = event.target.value;
    } else if (event.value !== undefined) {
      value = event.value;
    }

    if (typeof value === 'string' && value.trim() === '') {
      value = null;
    }

    this.filterSubject.next({ field, value });
  }

  // --- CARGA DE DATOS (LAZY LOAD) ---
  loadFacturas(event: TableLazyLoadEvent) {
    this.loading = true;
    const pageNumber = (event.first || 0) / (event.rows || 10) + 1;
    this.rows = event.rows || 10;
    this.currentPage = pageNumber;

    const request: FiltroFacturaRequest = {
      pagina: pageNumber,
      registrosPorPagina: this.rows,
      numero: this.filtros.numero || undefined,
      proveedorNombre: this.filtros.proveedorNombre || undefined,
      areaNombre: this.filtros.areaNombre || undefined,
      estado: this.filtros.estado || undefined,
      fechaEmisionDesde: this.filtros.fechaEmisionDesde || undefined,
      fechaEmisionHasta: this.filtros.fechaEmisionHasta || undefined
    };

    this.facturaService.listarFacturas(request).subscribe({
      next: (res) => {
        this.facturas = res.facturas || [];
        this.totalRecords = res.totalRegistros || 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar facturas:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar facturas' });
        this.loading = false;
      }
    });
  }

  // --- MÉTODOS CRUD ---

  crearFactura() {
    this.modoGestion = 'crear';
    this.facturaIdSeleccionada = null;
    this.gestionDialog = true;
  }

  verDetalle(factura: FacturaDto) {
    this.modoGestion = 'detalle';
    this.facturaIdSeleccionada = factura.id;
    this.gestionDialog = true;
  }

  editarFactura(factura: FacturaDto) {
    this.modoGestion = 'editar';
    this.facturaIdSeleccionada = factura.id;
    this.gestionDialog = true;
  }

  onFacturaGuardada() {
    this.gestionDialog = false;
    if(this.dt) this.dt.reset();
  }

  eliminarFactura(factura: FacturaDto) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar la factura ' + factura.numeroFactura + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if(!factura.id) return;

        this.facturaService.eliminarFactura(factura.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Factura eliminada' });
            if(this.dt) this.dt.reset();
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Error al eliminar' })
        });
      }
    });
  }

  abrirCambioEstado(factura: FacturaDto) {
    this.facturaSeleccionada = factura;
    this.nuevoEstado = factura.estado;
    this.comentarioEstado = '';
    this.estadoDialog = true;
  }

  guardarCambioEstado() {
    if (!this.facturaSeleccionada || !this.nuevoEstado) return;

    const usuarioId = Number.parseInt(sessionStorage.getItem('usuarioId') || '0');
    
    const request: CambioEstadoRequest = {
      facturaId: this.facturaSeleccionada.id,
      nuevoEstado: this.nuevoEstado,
      usuarioId: usuarioId,
      comentario: this.comentarioEstado || undefined
    };

    this.facturaService.cambiarEstadoFactura(request).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Estado actualizado' });
        this.estadoDialog = false;
        this.loadFacturas({ first: (this.currentPage - 1) * this.rows, rows: this.rows });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Error al cambiar estado' });
      }
    });
  }

  getSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch(estado) {
      case 'Aprobada': return 'success';
      case 'Pagada': return 'info';
      case 'Pendiente': return 'warn';
      case 'Rechazada': return 'danger';
      case 'Anulada': return 'secondary';
      default: return 'contrast';
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-EC');
  }
}