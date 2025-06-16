import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CajaGeneralConEstados, CajaGeneralPRCService, Sucursal } from '../../Services/CajaGeneral/CajaGeneralPRC.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast'; // Importar ToastModule
import { MessageService } from 'primeng/api'; // Importar MessageService
import { DatePickerModule } from 'primeng/datepicker';
import { EstadoCajaGeneralFilter, EstadoCajaGeneral,PagedResponse } from '../../Services/CajaGeneral/CajaGeneralPRC.service';



@Component({
  selector: 'app-caja-general-p',
  imports: [
    TableModule,
    InputTextModule,DatePickerModule,
    CalendarModule, // CalendarModule fue renombrado a DatePickerModule en el html
    ButtonModule,
    DialogModule,
    SelectModule,
    CommonModule,
    TagModule,
    FormsModule,
    DatePipe,
    MatIconModule,
    ToastModule, // Añadir ToastModule aquí
    // DatePickerModule ya lo tienes en el html, pero asegúrate que este en imports si lo usas
  ],
  templateUrl: './caja-general-p.component.html',
  styleUrl: './caja-general-p.component.css',
  providers: [MessageService] // Proveer MessageService aquí
})
export class CajaGeneralPComponent implements OnInit {
  sucursales: Sucursal[] = [];
  sucursalSeleccionada: Sucursal | undefined;
  fechasConRegistros: Date[] = [];
  fechaInicio: Date | undefined;
  fechaFin: Date | undefined;
  date: Date | undefined;
  data: any[] = [];
  visible: boolean = false;
  pdfUrl: SafeResourceUrl | null = null;
  loading: boolean = false;
  totalRegistros: number = 0;
  paginaActual: number = 1;
  tamanioPagina: number = 10;
  filtroDocumento: string = '';
  filtroComentario: string = '';
  filtroEstado: string = '';
  data2: EstadoCajaGeneral[] = [];

  filter: EstadoCajaGeneralFilter = {};
  estados: string[] = ['Pendiente', 'Aprobado', 'Rechazado'];
  filtroId: number | null = null;
  filtroCajaGeneralId: number | null = null;
  filtroUsuarioCambioId: number | null = null;
  filtroFechaCambio: Date | null = null;
  filtroNuevoEstado: string = '';
  filtroNombreDocumento: string = '';
  filtroNumeroComprobante: string = '';
  filtroEstadoCaja: string = '';


  constructor(
    private cajaGeneralPRCService: CajaGeneralPRCService,
    private sanitizer: DomSanitizer,
    private messageService: MessageService // Inyectar MessageService
  ) {}

  ngOnInit(): void {
    this.obtenerSucursalPerfil();
  }

  cargarEstados(): void {
  this.loading = true;
  console.log('cargarEstados() llamado. Página actual:', this.paginaActual, 'Tamaño página:', this.tamanioPagina, 'Filtro:', this.filter);
  this.cajaGeneralPRCService.getEstadosCajaGeneralPaginadoPost(
    this.paginaActual,
    this.tamanioPagina,
    this.filter // Pass the filter object
  ).subscribe({
    next: (response: PagedResponse) => {
      console.log('Respuesta del servicio:', response);
      if (response.estados && Array.isArray(response.estados)) {
        this.data = response.estados.map(item => ({
          id: item.id,
          numeroComprobante: item.cajaGeneral_NumeroComprobante,
          documento: item.cajaGeneral_NombreDocumento,
          archivo: item.cajaGeneral_RutaArchivo,
          fechaCarga: item.fechaCambio, // Ya es una DateTime en el DTO
          comentarioCargador: item.cajaGeneral_ComentarioCargador,
          comentario: item.cajaGeneral_Comentario,
          usuario: item.usuario || '', // Usar el campo correcto del DTO
          estado: item.nuevoEstado,
          item: item, // Puedes pasar el DTO completo si lo necesitas
          cajaGeneralId: item.cajaGeneralId,
          usuarioCambioId: item.usuarioCambioId,
          nuevoEstado: item.nuevoEstado,
          cajaGeneral_Id: item.cajaGeneral_Id,
          cajaGeneral_SucursalId: item.cajaGeneral_SucursalId,
          cajaGeneral_FechaCreacion: item.cajaGeneral_FechaCreacion,
          cajaGeneral_CargadorId: item.cajaGeneral_CargadorId,
          cajaGeneral_IngresadoPor: item.cajaGeneral_IngresadoPor,
        }));
        console.log('Valor de this.data en next:', this.data);
        console.log('Longitud de this.data:', this.data.length);
        this.totalRegistros = response.totalPages * response.pageSize; // Backend returns total pages, so calculate total records
      } else {
        console.error('Formato de respuesta de estados inesperado:', response);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al procesar los estados (formato incorrecto).' });
        this.data = [];
      }
      this.loading = false;
    },
    error: (error) => {
      console.error('Error al cargar los estados de caja general', error);
      console.log('Valor de this.data en error:', this.data);
      this.loading = false;
    }
  });
}

  obtenerSucursalPerfil() {
    // Verificar si sessionStorage está disponible
    if (typeof sessionStorage !== 'undefined') {
      const perfilId = sessionStorage.getItem('perfilId');
      if (perfilId && !isNaN(Number(perfilId))) {
        this.cajaGeneralPRCService.obtenerSucursalesPorPerfilId(Number(perfilId)).subscribe(
          (response: Sucursal[]) => { // Cambia el tipo de 'response' a 'Sucursal[]'
            this.sucursales = response; // Asigna directamente la respuesta a this.sucursales
          },
          (error) => {
            console.error('Error al obtener sucursales:', error);
            this.messageService.add({severity:'error', summary:'Error', detail:'Error al cargar sucursales.'});
          }
        );
      } else {
        console.error('perfilId no válido en sessionStorage.');
        this.messageService.add({severity:'error', summary:'Error', detail:'ID de perfil de usuario no válido.'});
      }
    } else {
    console.error('perfilId no válido en sessionStorage.');
    this.messageService.add({severity:'error', summary:'Error', detail:'ID de perfil de usuario no válido.'});
  }
}

  onPageChange(event: any): void {
    this.paginaActual = event.page + 1; // PrimeNG page index is 0-based
    this.tamanioPagina = event.rows;
    this.cargarEstados();
  }
  buscarRegistrosFiltrados(): void {
    if (this.sucursalSeleccionada) {
      const filtros: any = {
        sucursalId: this.sucursalSeleccionada.id,
        documento: this.filtroDocumento?.trim() || null,
        comentario: this.filtroComentario?.trim() || null,
        estado: this.filtroEstado || null,
        fechaInicio: this.fechaInicio ? this.fechaInicio.toISOString() : null,
        fechaFin: this.fechaFin ? this.fechaFin.toISOString() : null
      };

      const paginacion = {
        pagina: this.paginaActual,
        tamanioPagina: this.tamanioPagina
      };

      this.cajaGeneralPRCService.obtenerRegistrosFiltrados(filtros, paginacion).subscribe({
        next: (response) => {
          this.data = response.datos.map((item: CajaGeneralConEstados) => ({
            id: item.cajaGeneral.id,
            numeroComprobante: item.cajaGeneral.numeroComprobante,
            documento: item.cajaGeneral.nombreDocumento,
            archivo: item.cajaGeneral.rutaArchivo,
            fechaCarga: item.cajaGeneral.fechaCreacion,
            comentario: item.cajaGeneral.comentario,
            usuario: item.nombreCargador,
            estado: item.cajaGeneral.estado,
            item: item.cajaGeneral,
            comentarioCargador: item.cajaGeneral.comentarioCargador,
          }));
          this.totalRegistros = response.totalRegistros;
        },
        error: (error) => {
          console.error('Error al obtener registros filtrados:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al buscar registros filtrados.' });
        }
      });
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Selecciona una sucursal para buscar.' });
    }
  }



buscarRegistros() {
    if (this.sucursalSeleccionada && this.fechaInicio && this.fechaFin) {
      this.cajaGeneralPRCService.obtenerRegistrosPorSucursalYFechas(this.sucursalSeleccionada.id, this.fechaInicio, this.fechaFin).subscribe(
        (response) => {
          console.log('Registros obtenidos:', response);
          this.data = response.map((item: CajaGeneralConEstados) => ({
            id: item.cajaGeneral.id,
            numeroComprobante: item.cajaGeneral.numeroComprobante,
            documento: item.cajaGeneral.nombreDocumento,
            archivo: item.cajaGeneral.rutaArchivo,
            fechaCarga: item.cajaGeneral.fechaCreacion,
            comentario: item.cajaGeneral.comentario,
            usuario: item.nombreCargador,
            estado: item.cajaGeneral.estado,
            item: item.cajaGeneral,
            comentarioCargador: item.cajaGeneral.comentarioCargador,
          }));
        },
        (error) => {
          console.error('Error al obtener registros:', error);
          this.messageService.add({severity:'error', summary:'Error', detail:'Error al buscar registros.'});
        }
      );
    } else {
      console.error('Selecciona una sucursal y ambas fechas.');
      this.messageService.add({severity:'warn', summary:'Advertencia', detail:'Por favor, selecciona una sucursal y ambas fechas para buscar.'});
    }
  }

  cambiarEstado(item: any, nuevoEstado: string) {
    if (this.loading) return;

    // Validación del comentario
    if ((nuevoEstado === 'Aceptado' || nuevoEstado === 'Rechazado') && (!item.comentario || item.comentario.trim() === '')) {
      this.messageService.add({severity:'error', summary:'Error', detail:'El campo Comentario es obligatorio para Aprobar o Rechazar.'});
      return; // Detener la ejecución si el comentario es obligatorio y está vacío
    }

    this.loading = true;
    const comentario = item.comentario || '';
    const procesadorId = sessionStorage.getItem('usuarioId');

    if (!procesadorId) {
      console.error('No se encontró el usuarioId en sessionStorage.');
      this.messageService.add({severity:'error', summary:'Error', detail:'No se pudo obtener el ID de usuario.'});
      this.loading = false;
      return;
    }

    const procesadorIdNumber = Number(procesadorId);
    if (isNaN(procesadorIdNumber)) {
      console.error('usuarioId no válido.');
      this.messageService.add({severity:'error', summary:'Error', detail:'ID de usuario no válido.'});
      this.loading = false;
      return;
    }

    const cajaChicaId = item.id;

    if (nuevoEstado === 'Aceptado') {
      this.cajaGeneralPRCService.aceptarCajaGeneral(cajaChicaId, procesadorIdNumber, comentario).subscribe(
        (response) => {
          item.estado = 'Aprobado'; // Asumiendo que 'Aceptado' en la UI se muestra como 'Aprobado'
          this.messageService.add({severity:'success', summary:'Éxito', detail:'Caja General Aprobada correctamente.'});
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          console.error('Error al aceptar:', error);
          this.messageService.add({severity:'error', summary:'Error', detail:'Error al aprobar la Caja General.'});
        }
      );
    } else if (nuevoEstado === 'Rechazado') {
      this.cajaGeneralPRCService.rechazarCajaGeneral(cajaChicaId, procesadorIdNumber, comentario).subscribe(
        (response) => {
          item.estado = 'Rechazado';
          this.messageService.add({severity:'success', summary:'Éxito', detail:'Caja General Rechazada correctamente.'});
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          console.error('Error al rechazar:', error);
          this.messageService.add({severity:'error', summary:'Error', detail:'Error al rechazar la Caja General.'});
        }
      );
    }
  }

  onSucursalSeleccionada(): void {
    if (this.sucursalSeleccionada?.id) {
      this.cajaGeneralPRCService.obtenerFechasRegistrosPorSucursal(this.sucursalSeleccionada.id).subscribe({
        next: (fechas) => {
          this.fechasConRegistros = fechas.map(f => new Date(f));
        },
        error: (err) => {
          console.error('Error obteniendo fechas:', err);
          this.messageService.add({severity:'error', summary:'Error', detail:'Error al obtener fechas de registros.'});
        }
      });
    }
  }

  estaFechaMarcada(date: any): boolean {
  const fechaComparar = new Date(date.year, date.month, date.day);
  return this.fechasConRegistros.some(f => {
    //console.log('Tipo de f en estaFechaMarcada:', typeof f, f); // Agrega esta línea
    return f.getFullYear() === fechaComparar.getFullYear() &&
           f.getMonth() === fechaComparar.getMonth() &&
           f.getDate() === fechaComparar.getDate();
  });
}

  mostrarPDF(item: any) {
    const rutaArchivo = item.archivo;
    if (!rutaArchivo) {
      console.warn('No se encontró la ruta del archivo para este registro.');
      this.messageService.add({severity:'warn', summary:'Advertencia', detail:'Ruta de archivo no disponible.'});
      return;
    }
    this.loading = true;
    this.cajaGeneralPRCService.descargarArchivo(rutaArchivo).subscribe(blob => {
      const fileURL = window.URL.createObjectURL(blob);
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
      this.visible = true;
      this.loading = false;
    }, error => {
      console.error('Error al cargar el archivo', error);
      this.messageService.add({severity:'error', summary:'Error', detail:'Error al cargar el archivo PDF.'});
      this.loading = false;
    });
  }

  obtenerNombreDesdeRuta(ruta: string): string {
    return ruta.split('/').pop() || 'archivo.pdf';
  }

  onDialogHide() {
    if (this.pdfUrl) {
      window.URL.revokeObjectURL(this.pdfUrl as string);
      this.pdfUrl = null;
    }
  }


  // Example of how you might update the filter and reload data
  aplicarFiltro(nombreDocumento: string): void {
    this.filter.nombreDocumento = nombreDocumento;
    this.paginaActual = 1; // Reset to the first page when applying a new filter
    this.cargarEstados();

  }

  filtrarPorCampos(): void {
    this.filter = {
      id: this.filtroId !== null ? this.filtroId : undefined,
      cajaGeneralId: this.filtroCajaGeneralId !== null ? this.filtroCajaGeneralId : undefined,
      usuarioCambioId: this.filtroUsuarioCambioId !== null ? this.filtroUsuarioCambioId : undefined,
      fechaCambio: this.filtroFechaCambio !== null ? this.filtroFechaCambio : undefined,
      nuevoEstado: this.filtroNuevoEstado,
      nombreDocumento: this.filtroNombreDocumento,
      numeroComprobante: this.filtroNumeroComprobante,
      estadoCaja: this.filtroEstadoCaja
    };
    this.paginaActual = 1;
    this.cargarEstados();
  }
}
