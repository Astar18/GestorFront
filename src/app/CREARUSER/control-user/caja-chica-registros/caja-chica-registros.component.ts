// src/app/caja-chica-registros/caja-chica-registros.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
// Importaciones de tus modelos y servicio
import {
  CajaChica,
  PaginationParams,
  PagedResult,
  UsuarioService,
  Usuario
} from '../../../Services/USER/Usuario.service';

// Interface para las sucursales
interface Sucursal {
  id: number;
  codigoSucursal: string;
  nombre: string;
}

// Interface para los usuarios (basado en lo que devuelve obtenerUsuariosG)
// Se elimina porque ya se importa desde el servicio

export interface CajaChicaFilterParams extends PaginationParams {
  documentoNombre?: string;
  sucursalId?: number;
  fechaCreacionDesde?: Date;
  fechaCreacionHasta?: Date;
  ingresadoPor?: number; // Sigue siendo el ID para el backend
  cargadorId?: number; // Sigue siendo el ID para el backend
  numeroComprobante?: string;
  estado?: string;
  usuarioCambioEstadoId?: number;
  nuevoEstado?: string;
}

@Component({
  selector: 'app-caja-chica-registros',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,DividerModule,
    TableModule,
    CalendarModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    PaginatorModule
  ],
  templateUrl: './caja-chica-registros.component.html',
  styleUrls: ['./caja-chica-registros.component.css']
})
export class CajaChicaRegistrosComponent implements OnInit {

  cajaChicas: CajaChica[] = [];
  totalRecords: number = 0;
  loading: boolean = true;

  sucursales: Sucursal[] = []; // Lista completa de sucursales
  usuarios: Usuario[] = []; // Nueva lista para usuarios

  filterParams: CajaChicaFilterParams = {
    pageNumber: 1,
    pageSize: 10,
    documentoNombre: '',
    sucursalId: undefined,
    fechaCreacionDesde: undefined,
    fechaCreacionHasta: undefined,
    estado: '',
    ingresadoPor: undefined, // Inicializamos como undefined
    cargadorId: undefined // Inicializamos como undefined
  };

  estados: { label: string, value: string }[] = [
    { label: 'Estados', value: '' },
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'Aprobado', value: 'Aprobado' },
    { label: 'Rechazado', value: 'Rechazado' }
  ];
  getUsuarioCambioEstadoNombre(cajaChica: CajaChica): string {
      if (cajaChica.estados && cajaChica.estados.length > 0) {
        // Ordena los estados por fecha de cambio de forma descendente para obtener el último
        const ultimoEstado = cajaChica.estados.sort((a, b) => {
          const fechaA = new Date(a.fechaCambio).getTime();
          const fechaB = new Date(b.fechaCambio).getTime();
          return fechaB - fechaA;
        })[0];
        return this.getUsuarioNombre(ultimoEstado.usuarioCambioId);
      }
      return 'Sin Registro'; // O cualquier otro valor por defecto si no hay estados
    }
    getFechaCambioEstado(CajaChica: CajaChica): string {
        if (CajaChica.estados && CajaChica.estados.length > 0) {
          // Ordena los estados por fecha de cambio de forma descendente para obtener el último
          const ultimoEstado = CajaChica.estados.sort((a, b) => {
            const fechaA = new Date(a.fechaCambio).getTime();
            const fechaB = new Date(b.fechaCambio).getTime();
            return fechaB - fechaA;
          })[0];
          return ultimoEstado.fechaCambio;
        }
        return ''; // O el valor por defecto que prefieras si no hay estados
      }

  constructor(private usuarioService: UsuarioService) { }

  ngOnInit(): void {
    // Usamos Promise.all para cargar sucursales y usuarios en paralelo
    Promise.all([this.cargarSucursales(), this.cargarUsuarios()])
      .then(() => {
        // Una vez que ambos datos maestros están cargados, entonces cargamos la tabla
        this.loadCajaChicas({
          first: 0,
          rows: this.filterParams.pageSize,
          sortField: undefined,
          sortOrder: undefined,
          filters: undefined
        });
      })
      .catch(error => {
        console.error('Error al cargar datos maestros:', error);
        // Manejar el error, por ejemplo, mostrar un mensaje al usuario
      });
  }

  cargarSucursales(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.usuarioService.obtenerTodasLasSucursales().subscribe({
        next: (data: Sucursal[]) => {
          this.sucursales = [{ id: 0, codigoSucursal: '', nombre: 'Todas las Sucursales' }, ...data];
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar sucursales:', err);
          reject(err);
        }
      });
    });
  }

  // Nuevo método para cargar los usuarios
  cargarUsuarios(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.usuarioService.obtenerUsuariosG().subscribe({
        next: (data: Usuario[]) => {
          // Añadir una opción "Todos" para el filtro de usuarios si es necesario
          this.usuarios = [{
            id: 0,
            nombre: 'Sin Registro',
            apellido: '',
            cedula: '',
            sucursalId: 0,
            identificacion: '',
            correo: '',
            contraseña: '',
            estadoCuenta: '',
            perfilId: 0
          }, ...data];
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar usuarios:', err);
          reject(err);
        }
      });
    });
  }

  loadCajaChicas(event: any) {
    this.loading = true;

    const first = event.first ?? 0;
    const rows = event.rows == null ? this.filterParams.pageSize : event.rows;
    this.filterParams.pageNumber = Math.floor(first / rows) + 1;
    this.filterParams.pageSize = rows;

    const paramsToSend = { ...this.filterParams };
    if (paramsToSend.sucursalId === 0) {
      paramsToSend.sucursalId = undefined;
    }
    // Si 'Todos los Usuarios' (ID 0) es seleccionado, enviamos undefined al backend
    if (paramsToSend.ingresadoPor === 0) {
      paramsToSend.ingresadoPor = undefined;
    }
    if (paramsToSend.cargadorId === 0) {
      paramsToSend.cargadorId = undefined;
    }

    this.usuarioService.getCajaChicasFilteredAndPaginated(paramsToSend).subscribe({
      next: (result: PagedResult<CajaChica>) => {
        this.cajaChicas = result.items;
        this.totalRecords = result.totalCount;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar caja chicas:', err);
        this.loading = false;
      }
    });
  }

  getSucursalNombre(sucursalId: number): string {
    const sucursal = this.sucursales.find(s => s.id === sucursalId);
    return sucursal ? sucursal.nombre : 'Desconocida';
  }

  // Nuevo método para obtener el nombre del usuario por su ID
  getUsuarioNombre(userId: number): string {
    const usuario = this.usuarios.find(u => u.id === userId);
    return usuario ? usuario.nombre +'-'+ usuario.apellido: 'Desconocido';
  }

  applyFilters() {
    this.filterParams.pageNumber = 1;
    this.loadCajaChicas({
      first: 0,
      rows: this.filterParams.pageSize,
      sortField: undefined,
      sortOrder: undefined,
      filters: undefined
    });
  }

  clearFilters() {
    this.filterParams = {
      pageNumber: 1,
      pageSize: 10,
      documentoNombre: '',
      sucursalId: undefined,
      fechaCreacionDesde: undefined,
      fechaCreacionHasta: undefined,
      ingresadoPor: undefined, // Resetear a undefined
      cargadorId: undefined, // Resetear a undefined
      numeroComprobante: '',
      estado: '',
      usuarioCambioEstadoId: undefined,
      nuevoEstado: ''
    };
    this.applyFilters();
  }
}
