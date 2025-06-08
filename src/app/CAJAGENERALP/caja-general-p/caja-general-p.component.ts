import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import { CajaGeneralConEstados, CajaGeneralPRCService,Sucursal } from '../../Services/CajaGeneral/CajaGeneralPRC.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';

@Component({
    selector: 'app-caja-general-p',
    imports: [TableModule, InputTextModule, CalendarModule, ButtonModule,DialogModule,SelectModule,CommonModule,DatePickerModule,
       TagModule, FormsModule, DatePipe, MatIconModule],
    templateUrl: './caja-general-p.component.html',
    styleUrl: './caja-general-p.component.css'
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


    showDialog() {
        this.visible = true;
    }
  constructor(private cajaGeneralPRCService: CajaGeneralPRCService,private sanitizer: DomSanitizer) { }
  ngOnInit(): void {
    this.obtenerSucursalPerfil();
}
  obtenerSucursalPerfil(){
    const perfilId = sessionStorage.getItem('perfilId');
    if (perfilId && !isNaN(Number(perfilId))) {
        this.cajaGeneralPRCService.obtenerSucursalesPorPerfilId(Number(perfilId)).subscribe(
            (data) => {
                this.sucursales = data;
            },
            (error) => {
                console.error('Error al obtener sucursales:', error);
            }
        );
    } else {
        console.error('perfilId no válido en sessionStorage.');
    }
  }
  buscarRegistros() {
    if (this.sucursalSeleccionada && this.fechaInicio && this.fechaFin) {
        this.cajaGeneralPRCService.obtenerRegistrosPorSucursalYFechas(this.sucursalSeleccionada.id, this.fechaInicio, this.fechaFin).subscribe(
            (response) => {
              console.log('Registros obtenidos:', response);
                // Adaptar los datos para la tabla
                this.data = response.map((item: CajaGeneralConEstados) => ({
                    id: item.cajaGeneral.id,
                    numeroComprobante: item.cajaGeneral.numeroComprobante,
                    documento: item.cajaGeneral.nombreDocumento,
                    archivo: item.cajaGeneral.rutaArchivo,
                    fechaCarga: item.cajaGeneral.fechaCreacion,
                    comentario: item.cajaGeneral.comentario, // Puedes obtener el comentario de otro lugar si es necesario
                    usuario: item.nombreCargador,
                    estado: item.cajaGeneral.estado,
                    item: item.cajaGeneral, // Guardamos el item completo para usarlo en cambiarEstado
                }));
            },
            (error) => {
                console.error('Error al obtener registros:', error);
            }
        );
    } else {
        console.error('Selecciona una sucursal y ambas fechas.');
    }
}



cambiarEstado(item: any, nuevoEstado: string) {
  if (this.loading) return; // Evitar múltiples clics mientras se procesa
  this.loading = true;  // Activar el estado de carga
  const comentario = item.comentario || ''; // Puedes personalizar el comentario
  const procesadorId = sessionStorage.getItem('usuarioId');
  // Verificar si el usuarioId es válido
  if (!procesadorId) {
    console.error('No se encontró el usuarioId en sessionStorage.');
    this.loading = false;
    return;  // Detener la ejecución si no se encuentra el usuarioId
  }
  // Convertir a número, si es necesario
  const procesadorIdNumber = Number(procesadorId);
  if (isNaN(procesadorIdNumber)) {
    console.error('usuarioId no válido.');
    this.loading = false;
    return;  // Detener la ejecución si el usuarioId no es un número válido
  }
  // Asegurarse de que `item.id` tiene el valor correcto de cajaChicaId
  const cajaChicaId = item.id;
  // Cambiar el estado localmente antes de hacer la petición al backend
  item.estado = nuevoEstado;  // Actualizar el estado en la UI de forma inmediata
  // Crear el objeto que se va a enviar en el cuerpo de la solicitud
  const body = { cajaChicaId, procesadorId: procesadorIdNumber, comentario };
  // Si el estado es "Aceptado"
  if (nuevoEstado === 'Aceptado') {
    this.cajaGeneralPRCService.aceptarCajaGeneral(cajaChicaId, procesadorIdNumber, comentario).subscribe(
      (response) => {
        item.estado = 'Aceptado'; // Actualizar solo después de confirmación
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.error('Error al aceptar:', error);
      }
    );
  } else if (nuevoEstado === 'Rechazado') {
    this.cajaGeneralPRCService.rechazarCajaGeneral(cajaChicaId, procesadorIdNumber, comentario).subscribe(
      (response) => {
        item.estado = 'Rechazado'; // Actualizar solo después de confirmación
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.error('Error al rechazar:', error);
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
        }
      });
    }
  }
  estaFechaMarcada(date: any): boolean {
    const fechaComparar = new Date(date.year, date.month , date.day);
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
