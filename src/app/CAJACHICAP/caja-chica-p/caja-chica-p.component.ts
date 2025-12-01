import { Perfil } from './../../Services/Combos/Combo.service';
import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon'; // Usar MatIconModule en lugar de MatIcon
import { SelectModule } from 'primeng/select';
import { CajaChicaConEstados, CajaChicaPRCService, EstadoCajaChicaFilter, PagedResponse, Sucursal } from '../../Services/CajaChica/CajaChicaPRC.service';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DatePickerModule } from 'primeng/datepicker'; // Asegúrate de que este es el correcto
import { ToastModule } from 'primeng/toast'; // Importar ToastModule
import { MessageService } from 'primeng/api'; // Importar MessageService

@Component({
  selector: 'app-caja-chica-p',
  imports: [
    TableModule,
    InputTextModule,
    DatePickerModule, // Correcto, ya que usas p-datepicker
    ButtonModule,
    DialogModule,
    DatePicker,
    CommonModule,
    TagModule,
    FormsModule,
    DatePipe,
    MatIconModule, // Usar MatIconModule
    SelectModule,
    ToastModule, // Añadir ToastModule aquí
  ],
  templateUrl: './caja-chica-p.component.html',
  styleUrl: './caja-chica-p.component.css',
  providers: [MessageService] // Proveer MessageService aquí
})
export class CajaChicaPComponent implements OnInit {
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
filter: EstadoCajaChicaFilter = {};
  estados: string[] = ['Pendiente', 'Aprobado', 'Rechazado'];
  filtroId: number | null = null;
  filtroCajaGeneralId: number | null = null;
  filtroUsuarioCambioId: number | null = null;
  filtroFechaCambio: Date | null = null;
  filtroNuevoEstado: string = '';
  filtroNombreDocumento: string = '';
  filtroNumeroComprobante: string = '';
  filtroEstadoCaja: string = '';
  showDialog() {
    this.visible = true;
  }
    cargarEstados(): void {
    this.loading = true;
    console.log('cargarEstados() llamado. Página actual:', this.paginaActual, 'Tamaño página:', this.tamanioPagina, 'Filtro:', this.filter);
    this.cajaChicaPRCService.getEstadosCajaGeneralPaginadoPost(
      this.paginaActual,
      this.tamanioPagina,
      this.filter // Pass the filter object
    ).subscribe({
      next: (response: PagedResponse) => {
        console.log('Respuesta del servicio:', response);
        if (response.estados && Array.isArray(response.estados)) {
          this.data = response.estados.map(item => ({
            id: item.id,
            numeroComprobante: item.cajaChica_NumeroComprobante,
            documento: item.cajaChica_NombreDocumento,
            archivo: item.cajaChica_RutaArchivo,
            fechaCarga: item.fechaCambio, // Ya es una DateTime en el DTO
            comentarioCargador: item.cajaChica_ComentarioCargador,
            comentario: item.cajaChica_Comentario,
            usuario: item.usuario || '', // Usar el campo correcto del DTO
            estado: item.nuevoEstado,
            item: item, // Puedes pasar el DTO completo si lo necesitas
            cajaGeneralId: item.cajaChicaId,
            usuarioCambioId: item.usuarioCambioId,
            nuevoEstado: item.nuevoEstado,
            // cajaChica_Id: item.cajaChica_Id,
            cajaChica_SucursalId: item.cajaChica_SucursalId,
            cajaChica_FechaCreacion: item.cajaChica_FechaCreacion,
            cajaChica_CargadorId: item.cajaChica_CargadorId,
            cajaChica_IngresadoPor: item.cajaChica_IngresadoPor,
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

  constructor(
    private cajaChicaPRCService: CajaChicaPRCService,
    private sanitizer: DomSanitizer,
    private messageService: MessageService // Inyectar MessageService
  ) { }

  ngOnInit(): void {
    this.obtenerSucursalPerfil();
  }

  obtenerSucursalPerfil() {
    const perfilId = sessionStorage.getItem('perfilId');
    if (perfilId && !isNaN(Number(perfilId))) {
      this.cajaChicaPRCService.obtenerSucursalesPorPerfil(Number(perfilId)).subscribe(
        (data) => {
          this.sucursales = data;
        },
        (error) => {
          console.error('Error al obtener sucursales:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar sucursales.' });
        }
      );
    } else {
      console.error('perfilId no válido en sessionStorage.');
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'ID de perfil de usuario no válido.' });
    }
  }

  buscarRegistros() {
    if (this.sucursalSeleccionada && this.fechaInicio && this.fechaFin) {
      this.cajaChicaPRCService.obtenerRegistrosPorSucursalYFechas(this.sucursalSeleccionada.id, this.fechaInicio, this.fechaFin).subscribe(
        (response) => {
          this.data = response.map((item: CajaChicaConEstados) => ({
            id: item.cajaChica.id,
            numeroComprobante: item.cajaChica.numeroComprobante,
            documento: item.cajaChica.documentoNombre,
            archivo: item.cajaChica.rutaArchivo,
            fechaCarga: item.cajaChica.fechaCreacion,
            comentario: item.cajaChica.comentario,
            usuario: item.nombreCargador,
            estado: item.cajaChica.estado,
            item: item.cajaChica,
            comentarioCargador: item.cajaChica.comentarioCargador
          }));
        },
        (error) => {
          console.error('Error al obtener registros:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al buscar registros.' });
        }
      );
    } else {
      console.error('Selecciona una sucursal y ambas fechas.');
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor, selecciona una sucursal y ambas fechas.' });
    }
  }

  cambiarEstado(item: any, nuevoEstado: string) {
    if (this.loading) return;

    // Validación del comentario
    if ((nuevoEstado === 'Aceptado' || nuevoEstado === 'Rechazado') && (!item.comentario || item.comentario.trim() === '')) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El campo Comentario es obligatorio para Aprobar o Rechazar.' });
      return; // Detener la ejecución si el comentario es obligatorio y está vacío
    }

    this.loading = true;
    const comentario = item.comentario || '';

    const procesadorId = sessionStorage.getItem('usuarioId');
    if (!procesadorId) {
      console.error('No se encontró el usuarioId en sessionStorage.');
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo obtener el ID de usuario.' });
      this.loading = false;
      return;
    }

    const procesadorIdNumber = Number(procesadorId);
    if (isNaN(procesadorIdNumber)) {
      console.error('usuarioId no válido.');
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'ID de usuario no válido.' });
      this.loading = false;
      return;
    }

    const cajaChicaId = item.id;

    if (nuevoEstado === 'Aceptado') {
      this.cajaChicaPRCService.aceptarCajaChica(cajaChicaId, procesadorIdNumber, comentario).subscribe(
        (response) => {
          item.estado = 'Aprobado'; // Actualizar el estado en la UI a "Aprobado"
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Caja Chica Aprobada correctamente.' });
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          console.error('Error al aceptar:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al aprobar la Caja Chica.' });
          // Revertir el estado si la llamada falla, si es necesario
          // item.estado = 'Pendiente'; // O el estado anterior si lo tienes
        }
      );
    } else if (nuevoEstado === 'Rechazado') {
      this.cajaChicaPRCService.rechazarCajaChica(cajaChicaId, procesadorIdNumber, comentario).subscribe(
        (response) => {
          item.estado = 'Rechazado'; // Actualizar el estado en la UI a "Rechazado"
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Caja Chica Rechazada correctamente.' });
          this.loading = false;
        },
        (error) => {
          this.loading = false;
          console.error('Error al rechazar:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al rechazar la Caja Chica.' });
          // Revertir el estado si la llamada falla, si es necesario
          // item.estado = 'Pendiente'; // O el estado anterior si lo tienes
        }
      );
    }
  }

  onSucursalSeleccionada(): void {
    if (this.sucursalSeleccionada?.id) {
      this.cajaChicaPRCService.obtenerFechasPorSucursal(this.sucursalSeleccionada.id).subscribe({
        next: (fechas) => {
          this.fechasConRegistros = fechas.map(f => new Date(f));
        },
        error: (err) => {
          console.error('Error obteniendo fechas:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener fechas de registros.' });
        }
      });
    }
  }

  estaFechaMarcada(date: any): boolean {
    const fechaComparar = new Date(date.year, date.month, date.day);
    return this.fechasConRegistros.some(f =>
      f.getFullYear() === fechaComparar.getFullYear() &&
      f.getMonth() === fechaComparar.getMonth() &&
      f.getDate() === fechaComparar.getDate()
    );
  }

  mostrarPDF(item: any) {
    const rutaArchivo = item.archivo;
    if (!rutaArchivo) {
      console.warn('No se encontró la ruta del archivo para este registro.');
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Ruta de archivo no disponible.' });
      return;
    }
    this.loading = true;
    this.cajaChicaPRCService.descargarArchivo(rutaArchivo).subscribe(blob => {
      const fileURL = window.URL.createObjectURL(blob);
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
      this.visible = true;
      this.loading = false;
    }, error => {
      console.error('Error al cargar el archivo', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el archivo PDF.' });
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
}
