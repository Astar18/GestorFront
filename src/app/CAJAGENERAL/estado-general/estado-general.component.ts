import { Component, OnInit } from '@angular/core';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { CajaGeneralService,CajaGeneral } from '../../Services/CajaGeneral/CajaGeneral.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { MatIconModule } from '@angular/material/icon';
import { CajaGeneralPRCService } from '../../Services/CajaGeneral/CajaGeneralPRC.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DialogModule } from 'primeng/dialog';
@Component({
  selector: 'app-estado-general',
  standalone: true,
  imports: [TableModule, CommonModule, ToastModule,FormsModule, InputTextModule,CalendarModule,ButtonModule, MatIconModule, DialogModule],
  templateUrl: './estado-general.component.html',
  styleUrl: './estado-general.component.css',
  providers: [MessageService]
})
export class EstadoGeneralComponent implements OnInit {
  documentos: CajaGeneral[] = [];
  totalRegistros: number = 0;
  cargando: boolean = false;
  private filtroTimeout: any;
  loading: boolean = false;
  visible: boolean = false;
  pdfUrl: SafeResourceUrl | null = null;

  filtros = {
  numeroComprobante: '',
  nombreDocumento: '',
  comentarioCargador: '',
  comentario: '',
  estado: '',
  fechaInicio: null,
  fechaFin: null
};

  lazyEventGlobal?: TableLazyLoadEvent;

  constructor(
    private cajaGeneralService: CajaGeneralService,
    private messageService: MessageService,private cajaGeneralPRCService: CajaGeneralPRCService,private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {}

  cargarDocumentosConRutaLazy(event: TableLazyLoadEvent) {
    this.lazyEventGlobal = event;
    this.cargando = true;

    const sucursalId = sessionStorage.getItem('sucursal');

    const filtro = {
  sucursalId: sucursalId,
  pagina: (event.first! / event.rows!) + 1,
  tamanoPagina: event.rows,
  numeroComprobante: this.filtros.numeroComprobante || null,
  nombreDocumento: this.filtros.nombreDocumento || null,
  comentarioCargador: this.filtros.comentarioCargador || null,
  comentario: this.filtros.comentario || null,
  estado: this.filtros.estado || null,
  fechaInicio: this.filtros.fechaInicio,
  fechaFin: this.filtros.fechaFin
};



    this.cajaGeneralService.obtenerCajaGeneralFiltrado(filtro).subscribe(
      (respuesta) => {
        this.documentos = respuesta.datos;
        this.totalRegistros = respuesta.totalRegistros;
        this.cargando = false;
      },
      (error) => {
        console.error('Error al cargar documentos:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los documentos.' });
        this.cargando = false;
      }
    );
  }

  onFiltroChange() {
  // Cancela el timeout anterior
  if (this.filtroTimeout) {
    clearTimeout(this.filtroTimeout);
  }

  // Espera 500ms antes de ejecutar la búsqueda
  this.filtroTimeout = setTimeout(() => {
    if (this.lazyEventGlobal) {
      this.lazyEventGlobal.first = 0;
      this.cargarDocumentosConRutaLazy(this.lazyEventGlobal);
    }
  }, 500); // Puedes ajustar el tiempo (milisegundos) a tu gusto
}
mostrarPDF(documento: any) {
  const rutaArchivo = documento.rutaArchivo;
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

}
