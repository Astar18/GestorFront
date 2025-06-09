import { Perfil } from './../../Services/Combos/Combo.service';
import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar'; // Aunque en HTML se usa DatePickerModule
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon'; // Usar MatIconModule en lugar de MatIcon
import { SelectModule } from 'primeng/select';
import { CajaChicaConEstados, CajaChicaPRCService, Sucursal } from '../../Services/CajaChica/CajaChicaPRC.service';
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

  showDialog() {
    this.visible = true;
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
