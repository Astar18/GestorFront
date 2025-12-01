import { Component, OnInit, inject, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { TableModule, TableLazyLoadEvent, Table } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea'; // Agregado para descripción
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select'; // PrimeNG v18+

// Services & RxJS
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { 
  AreaService, 
  AreaDto, 
  FiltroAreaRequest 
} from '../../Services/FacturaE1/area.service'; // Ajusta la ruta a tu servicio

@Component({
  selector: 'app-area',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TableModule, 
    DialogModule, 
    ButtonModule, 
    InputTextModule,
    TextareaModule,
    ToastModule, 
    ToolbarModule, 
    ConfirmDialogModule, 
    TagModule,
    SelectModule
  ],
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class AreaComponent implements OnInit, OnDestroy {
  
  private readonly areaService = inject(AreaService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  
  @ViewChild('dt') dt: Table | undefined;

  // --- VARIABLES DE ESTADO ---
  areas: AreaDto[] = [];
  totalRecords: number = 0;
  loading: boolean = true;
  rows: number = 10;
  currentPage: number = 1;

  // Filtros locales
  filtros: any = {
    nombre: '',
    codigo: '',
    estado: null // null = Todos, true = Activo, false = Inactivo
  };

  // RxJS Debounce
  private readonly filterSubject = new Subject<{ field: string, value: any }>();
  private filterSubscription: Subscription | undefined;

  // Modal
  areaDialog: boolean = false;
  submitted: boolean = false;
  area: AreaDto = this.getEmptyArea();

  // --- OPCIONES PARA SELECTS ---
  // Para el formulario (Crear/Editar) - Valor obligatorio
  estadoOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  // Para el filtro de la tabla - Incluye opción vacía
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
        this.dt.reset(); // Vuelve a página 1 y dispara loadAreas
      }
    });
  }

  ngOnDestroy() {
    if (this.filterSubscription) {
      this.filterSubscription.unsubscribe();
    }
  }

  // Método inteligente para detectar Input o Select
  onFilterInput(event: any, field: string) {
    let value: any = null;

    // 1. Si es Input de Texto
    if (event.target) {
      value = event.target.value;
    } 
    // 2. Si es PrimeNG Select (puede ser boolean o string)
    else if (event.value !== undefined) {
      value = event.value;
    }

    // Limpieza de nulos/vacíos para strings
    if (typeof value === 'string' && value.trim() === '') {
        value = null; // O '' según prefieras manejarlo
    }

    this.filterSubject.next({ field, value });
  }

  // --- CARGA DE DATOS (LAZY LOAD) ---
  loadAreas(event: TableLazyLoadEvent) {
    this.loading = true;
    const pageNumber = (event.first || 0) / (event.rows || 10) + 1;
    this.rows = event.rows || 10;
    this.currentPage = pageNumber;

    const request: FiltroAreaRequest = {
      pagina: pageNumber,
      registrosPorPagina: this.rows,
      nombre: this.filtros.nombre || null,
      codigo: this.filtros.codigo || null,
      estado: this.filtros.estado // Pasa boolean o null
    };

    this.areaService.listarAreas(request).subscribe({
      next: (res) => {
        
        this.areas = res.areas || [];
        this.totalRecords = res.totalRegistros || 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar áreas:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar áreas' });
        this.loading = false;
      }
    });
  }

  // --- MÉTODOS CRUD ---

  getEmptyArea(): AreaDto {
    return { id: 0, nombre: '', codigo: '', estado: true };
  }

  openNew() {
    this.area = this.getEmptyArea();
    this.submitted = false;
    this.areaDialog = true;
  }

  editArea(item: AreaDto) {
    this.area = { ...item }; // Clonar
    this.areaDialog = true;
  }

  hideDialog() {
    this.areaDialog = false;
    this.submitted = false;
  }

  saveArea() {
    this.submitted = true;

    // Validación básica
    if (!this.area.nombre?.trim()) {
      return;
    }

    // Lógica Editar vs Crear
    if (this.area.id && this.area.id > 0) {
      this.areaService.editarArea(this.area).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Área actualizada' });
          this.hideDialog();
          // Recargar manteniendo página actual
          this.loadAreas({ first: (this.currentPage - 1) * this.rows, rows: this.rows });
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al actualizar' })
      });
    } else {
      this.areaService.crearArea(this.area).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Área creada' });
          this.hideDialog();
          if(this.dt) this.dt.reset(); // Ir a la primera página
        },
        error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al crear' })
      });
    }
  }

  deleteArea(item: AreaDto) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar el área ' + item.nombre + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        // Validación de ID seguro
        if(!item.id) return;

        this.areaService.eliminarArea(item.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Exitoso', detail: 'Área eliminada' });
            if(this.dt) this.dt.reset();
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.mensaje || 'Error al eliminar' })
        });
      }
    });
  }
}