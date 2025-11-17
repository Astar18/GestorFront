import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CajaGeneralConEstados, CajaGeneralPRCService, Sucursal } from '../../Services/CajaGeneral/CajaGeneralPRC.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast'; // Importar ToastModule
import { MessageService } from 'primeng/api'; // Importar MessageService
import { EstadoCajaGeneralFilter, EstadoCajaGeneral,PagedResponse,FechaConEstados } from '../../Services/CajaGeneral/CajaGeneralPRC.service';
import { DatePickerModule } from 'primeng/datepicker';


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
    ToastModule,
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
  listaDeEstados: string[] = ['Aprobado', 'Rechazado', 'Pendiente'];
  estadoSeleccionado: string | null = null;
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
  anioSeleccionado: Date = new Date();
  fechasConEstados: FechaConEstados[] = [];
  isBrowser: boolean;


  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly cajaGeneralPRCService: CajaGeneralPRCService,
    private readonly sanitizer: DomSanitizer,
    private readonly messageService: MessageService // Inyectar MessageService
  )
  {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

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
      this.cajaGeneralPRCService.obtenerRegistrosPorSucursalYFechas(this.sucursalSeleccionada.id, this.fechaInicio, this.fechaFin,this.estadoSeleccionado).subscribe(
        (response) => {
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
  obtenerSucursalPerfil(): void {
    const perfilId = sessionStorage.getItem('perfilId');
    if (perfilId && !isNaN(Number(perfilId))) {
      this.cajaGeneralPRCService.obtenerSucursalesPorPerfilId(Number(perfilId)).subscribe({
        next: (response: Sucursal[]) => {
          this.sucursales = response;
          // 2. Si se encontraron sucursales, selecciona la primera por defecto.
          if (this.sucursales.length > 0) {
            this.sucursalSeleccionada = this.sucursales[0];
            // 3. Carga los datos para la sucursal y año seleccionados.
            this.cargarFechas();
          }
        },
        error: (error) => {
          console.error('Error al obtener sucursales:', error);
          this.messageService.add({severity:'error', summary:'Error', detail:'Error al cargar sucursales.'});
        }
      });
    } else {
      this.messageService.add({severity:'error', summary:'Error', detail:'ID de perfil de usuario no válido.'});
    }
  }
  cargarFechas(): void {
    if (this.sucursalSeleccionada?.id && this.anioSeleccionado) {
      const sucursalId = this.sucursalSeleccionada.id;
      const anio = this.anioSeleccionado.getFullYear();

      // Utiliza el método del servicio que acepta ambos parámetros.
      this.cajaGeneralPRCService.obtenerFechasConEstados(sucursalId, anio).subscribe({
        next: (respuesta) => {
          this.fechasConEstados = respuesta;
          console.log('Fechas con estados obtenidas:', this.fechasConEstados);
        },
        error: (err) => {
          console.error('Error obteniendo fechas y estados:', err);
          this.messageService.add({severity:'error', summary:'Error', detail:'Error al obtener los registros.'});
        }
      });
    }
  }


  obtenerClaseParaFecha(date: any): string {
  const fechaComparar = new Date(date.year, date.month, date.day).getTime();
  const itemFecha = this.fechasConEstados.find(item => {
    const fechaItem = new Date(item.fecha);
    const fechaItemComparable = new Date(fechaItem.getFullYear(), fechaItem.getMonth(), fechaItem.getDate()).getTime();
    return fechaItemComparable === fechaComparar;
  });
  if (!itemFecha) {
    return '';
  }

  if (itemFecha.estados.includes('Pendiente')) {
    return 'fecha-marcada fecha-pendiente';
  }
   if (itemFecha.estados.includes('Aprobado')) {
    return 'fecha-marcada fecha-aprobada';
  }
  return '';
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
