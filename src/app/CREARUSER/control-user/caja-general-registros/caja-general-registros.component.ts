import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Importaciones de módulos de PrimeNG
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { DividerModule } from 'primeng/divider'; // Para el divisor visual en el HTML


// Importaciones de tus modelos y servicio. ¡Asegúrate que estas rutas sean correctas!
import {
  CajaGeneral,
  CajaGeneralFilterParams,
  PagedResult,

  Usuario,
  UsuarioService // Tu servicio que contiene los métodos para CajaGeneral, sucursales y usuarios
} from '../../../Services/USER/Usuario.service';
interface Sucursal{
  id: number;
  codigoSucursal: string;
  nombre: string;
}
@Component({
  selector: 'app-caja-general-registros',
  standalone: true, // Define este componente como un componente independiente
  imports: [
    CommonModule,
    FormsModule, // Módulo necesario para [(ngModel)]
    // Módulos de PrimeNG usados en la plantilla
    TableModule,
    CalendarModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    PaginatorModule,
    DividerModule,

  ],
  templateUrl: './caja-general-registros.component.html',
  styleUrls: ['./caja-general-registros.component.css']
})
export class CajaGeneralRegistrosComponent implements OnInit {

  cajaGenerales: CajaGeneral[] = []; // Array para almacenar los registros de Caja General
  totalRecords: number = 0; // Número total de registros para la paginación de PrimeNG
  loading: boolean = true; // Indicador de carga para la tabla

  sucursales: Sucursal[] = []; // Lista de sucursales para el dropdown de filtro
  usuarios: Usuario[] = []; // Lista de usuarios para los dropdowns de filtro (Ingresado Por, Cargador)

  // Parámetros de filtro y paginación
  filterParams: CajaGeneralFilterParams = {
    pageNumber: 1,
    pageSize: 10,
    nombreDocumento: '',
    sucursalId: undefined,
    fechaCreacionDesde: undefined,
    fechaCreacionHasta: undefined,
    estado: '',
    cargadorId: undefined,
    ingresadoPor: undefined,
    numeroComprobante: '',
    sortField: undefined,
    sortOrder: undefined
  };

  // Opciones de estado para el dropdown de filtro
  estados: { label: string, value: string }[] = [
    { label: 'Estados', value: '' }, // Opción para no filtrar por estado
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'Aprobado', value: 'Aprobado' },
    { label: 'Rechazado', value: 'Rechazado' }
  ];

  constructor(private usuarioService: UsuarioService) { } // Inyección del servicio

  ngOnInit(): void {
    // Se cargan las sucursales y los usuarios en paralelo.
    // Una vez que ambas cargas maestras se completan, se cargan los datos de la tabla.
    Promise.all([this.cargarSucursales(), this.cargarUsuarios()])
      .then(() => {
        // Carga inicial de la tabla al montar el componente
        this.loadCajaGenerales({
          first: 0, // Inicia en el primer registro
          rows: this.filterParams.pageSize, // Usa el tamaño de página por defecto
          sortField: undefined,
          sortOrder: undefined,
          filters: undefined
        });
      })
      .catch(error => {
        console.error('Error al cargar datos maestros para Caja General:', error);
        // Aquí podrías mostrar un mensaje de error al usuario
      });
  }
  getUsuarioCambioEstadoNombre(cajaGeneral: CajaGeneral): string {
    if (cajaGeneral.estados && cajaGeneral.estados.length > 0) {
      // Ordena los estados por fecha de cambio de forma descendente para obtener el último
      const ultimoEstado = cajaGeneral.estados.sort((a, b) => {
        const fechaA = new Date(a.fechaCambio).getTime();
        const fechaB = new Date(b.fechaCambio).getTime();
        return fechaB - fechaA;
      })[0];
      return this.getUsuarioNombre(ultimoEstado.usuarioCambioId);
    }
    return 'Sin Registro'; // O cualquier otro valor por defecto si no hay estados
  }
  getFechaCambioEstado(cajaGeneral: CajaGeneral): string {
    if (cajaGeneral.estados && cajaGeneral.estados.length > 0) {
      // Ordena los estados por fecha de cambio de forma descendente para obtener el último
      const ultimoEstado = cajaGeneral.estados.sort((a, b) => {
        const fechaA = new Date(a.fechaCambio).getTime();
        const fechaB = new Date(b.fechaCambio).getTime();
        return fechaB - fechaA;
      })[0];
      return ultimoEstado.fechaCambio;
    }
    return ''; // O el valor por defecto que prefieras si no hay estados
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


  cargarUsuarios(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.usuarioService.obtenerUsuariosG().subscribe({
        next: (data: Usuario[]) => {
          this.usuarios = [{
            id: 0,
            nombre: 'Todos los Usuarios',
            apellido: '',
            cedula: '',
            sucursalId: 0,
            identificacion: '',
            correo: '',
            contraseña: '',
            estadoCuenta: '', // Valor por defecto, ajusta según tu modelo
            perfilId: 0      // Valor por defecto, ajusta según tu modelo
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


  loadCajaGenerales(event: any) { // 'any' se usa para LazyLoadEvent si no se importa explícitamente
    this.loading = true;

    // Calcula el número de página basándose en el índice inicial y el tamaño de página
    const first = event.first ?? 0;
    const rows = event.rows == null ? this.filterParams.pageSize : event.rows;
    this.filterParams.pageNumber = Math.floor(first / rows) + 1;
    this.filterParams.pageSize = rows;

    // Asigna el campo de ordenamiento y la dirección desde el evento de PrimeNG
    this.filterParams.sortField = event.sortField;
    this.filterParams.sortOrder = event.sortOrder; // 1 para ascendente, -1 para descendente

    // Prepara los parámetros para enviar al backend, manejando los valores "Todos"
    const paramsToSend: CajaGeneralFilterParams = { ...this.filterParams };
    if (paramsToSend.sucursalId === 0) paramsToSend.sucursalId = undefined;
    if (paramsToSend.cargadorId === 0) paramsToSend.cargadorId = undefined;
    if (paramsToSend.ingresadoPor === 0) paramsToSend.ingresadoPor = undefined;
    if (paramsToSend.estado === '') paramsToSend.estado = undefined; // Si "Todos" es cadena vacía

    // Llama al servicio para obtener los datos paginados y filtrados
    this.usuarioService.getCajaGeneralFilteredAndPaginated(paramsToSend).subscribe({
      next: (result: PagedResult<CajaGeneral>) => {
        this.cajaGenerales = result.items;
        this.totalRecords = result.totalCount;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar caja general:', err);
        this.loading = false;
        // Opcional: mostrar un mensaje de error al usuario
      }
    });
  }
  getSucursalNombre(sucursalId: number): string {
    const sucursal = this.sucursales.find(s => s.id === sucursalId);
    return sucursal ? sucursal.nombre  : 'Desconocida';
  }


  getUsuarioNombre(userId: number | undefined): string {
    if (userId === undefined || userId === null) {
      return 'Sin Registro'; // Por ejemplo, si el campo no siempre tiene un valor
    }
    const usuario = this.usuarios.find(u => u.id === userId);
    return usuario ? usuario.nombre +'-'+ usuario.apellido : 'Desconocido';
  }

  applyFilters() {
    this.filterParams.pageNumber = 1; // Reiniciar a la primera página al aplicar nuevos filtros
    this.loadCajaGenerales({
      first: 0, // Simula el evento para la primera página
      rows: this.filterParams.pageSize,
      sortField: undefined, // Si los filtros no cambian el orden, se pasa undefined
      sortOrder: undefined,
      filters: undefined
    });
  }

  /**
   * Limpia todos los campos de filtro y recarga la tabla con los valores por defecto.
   */
  clearFilters() {
    this.filterParams = {
      pageNumber: 1,
      pageSize: 10,
      nombreDocumento: '',
      sucursalId: undefined,
      fechaCreacionDesde: undefined,
      fechaCreacionHasta: undefined,
      cargadorId: undefined,
      ingresadoPor: undefined,
      numeroComprobante: '',
      estado: '',
      sortField: undefined,
      sortOrder: undefined
    };
    this.applyFilters(); // Aplica los filtros limpios para recargar la tabla
  }

}
