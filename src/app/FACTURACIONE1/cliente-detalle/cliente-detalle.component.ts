import { Component, OnInit, inject, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, TableLazyLoadEvent, Table } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators'; 
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { SelectButtonModule } from 'primeng/selectbutton';
import { 
  ClienteService, 
  ProveedorDto, 
  FiltroProveedorRequest // Usamos la nueva interfaz
} from '../../Services/FacturaE1/cliente.service';

@Component({
  selector: 'app-cliente-detalle',
  standalone: true,
  imports: [
    CommonModule,SelectModule,TextareaModule, FormsModule,SelectButtonModule, TableModule, DialogModule, ButtonModule, 
    InputTextModule, ToastModule, ToolbarModule, ConfirmDialogModule, TagModule
  ],
  templateUrl: './cliente-detalle.component.html',
  styleUrls: ['./cliente-detalle.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class ClienteDetalleComponent implements OnInit, OnDestroy {
  
  private readonly proveedorService = inject(ClienteService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  estadoOptions = [
    { label: 'Activo', value: 'Activo' },
    { label: 'Inactivo', value: 'Inactivo' }
  ];

  // Para el filtro de la tabla, agregamos la opción "Todos"
  estadoFilterOptions = [
    { label: 'Todos', value: '' },
    ...this.estadoOptions
  ];
  
  @ViewChild('dt') dt: Table | undefined;

  proveedores: ProveedorDto[] = [];
  totalRecords: number = 0;
  loading: boolean = true;
  rows: number = 10;
  currentPage: number = 1;

  // Objeto local para almacenar los valores de los inputs
  filtros: any = {
    identificacion: '',
    razonSocial: '',
    nombreComercial: '',
    telefono: '',
    estado: ''
  };

  // RxJS: El Subject ahora recibe un objeto { field, value }
  private filterSubject = new Subject<{ field: string, value: string }>();
  private filterSubscription: Subscription | undefined;

  proveedorDialog: boolean = false;
  submitted: boolean = false;
  proveedor: ProveedorDto = this.getEmptyProveedor();

  ngOnInit() {
    this.loading = true;

    // Configuración del Debounce
    this.filterSubscription = this.filterSubject.pipe(
      debounceTime(500) // Espera 500ms al escribir
    ).subscribe((data) => {
      // 1. Actualizar el filtro específico en nuestro objeto local
      this.filtros[data.field] = data.value;
      
      // 2. Resetear la tabla (esto dispara loadProveedores automáticamente)
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

  // Este método se llama desde el HTML en cada input
  onFilterInput(event: any, field: string) {
    let value = '';

    // CASO 1: Es un Input de Texto (teclado)
    if (event.target) {
      value = event.target.value;
    }
    // CASO 2: Es un p-select / Dropdown (selección)
    else if (event.value !== undefined) {
      value = event.value;
    }
    
    // Si se limpia el select (la X), el value puede ser null
    if (value === null) {
      value = '';
    }

    // Enviamos al Subject para el Debounce
    this.filterSubject.next({ field, value });
  }

  loadProveedores(event: TableLazyLoadEvent) {
    this.loading = true;
    const pageNumber = (event.first || 0) / (event.rows || 10) + 1;
    this.rows = event.rows || 10;
    this.currentPage = pageNumber;

    // Mapeamos los datos para el Backend
    const request: FiltroProveedorRequest = {
      pagina: pageNumber,
      registrosPorPagina: this.rows,
      // Mapeo de filtros individuales
      identificacion: this.filtros.identificacion || null,
      razonSocial: this.filtros.razonSocial || null,
      nombreComercial: this.filtros.nombreComercial || null,
      telefono: this.filtros.telefono || null,
      estado: this.filtros.estado || null
    };

    this.proveedorService.getAllPaginado(request).subscribe({
      next: (res) => {
        this.proveedores = res.proveedores;
        this.totalRecords = res.totalRegistros;
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar datos' });
        this.loading = false;
      }
    });
  }

  // --- CRUD METHODS (Sin cambios) ---
  getEmptyProveedor(): ProveedorDto {
    return { id: 0, razonSocial: '', nombreComercial: '', identificacion: '', direccion: '', telefono: '', correo: '', estado: 'Activo' };
  }
  openNew() { this.proveedor = this.getEmptyProveedor(); this.submitted = false; this.proveedorDialog = true; }
  editProveedor(prov: ProveedorDto) { this.proveedor = { ...prov }; this.proveedorDialog = true; }
  hideDialog() { this.proveedorDialog = false; this.submitted = false; }
  
  saveProveedor() {
    this.submitted = true;
    if (!this.proveedor.razonSocial?.trim() || !this.proveedor.identificacion?.trim()) return;

    if (this.proveedor.id && this.proveedor.id > 0) {
      this.proveedorService.update(this.proveedor).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Actualizado' });
          this.hideDialog();
          // Recargamos manteniendo la página actual
          this.loadProveedores({ first: (this.currentPage - 1) * this.rows, rows: this.rows }); 
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error })
      });
    } else {
      this.proveedorService.create(this.proveedor).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Creado' });
          this.hideDialog();
          if(this.dt) this.dt.reset(); // Volver a pagina 1
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error })
      });
    }
  }

  deleteProveedor(prov: ProveedorDto) {
    this.confirmationService.confirm({
      message: '¿Eliminar a ' + prov.razonSocial + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.proveedorService.delete(prov.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Eliminado' });
            if(this.dt) this.dt.reset();
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.error || 'Error' })
        });
      }
    });
  }
}