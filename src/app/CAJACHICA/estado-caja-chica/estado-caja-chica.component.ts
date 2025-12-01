import { MessageService } from 'primeng/api';
import { CajaChica, CajaChicaService,CajaChicaFiltroDto } from './../../Services/CajaChica/caja-chica.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { DatePicker } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MatIconModule } from '@angular/material/icon';
import { CajaGeneralPRCService } from '../../Services/CajaGeneral/CajaGeneralPRC.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DialogModule } from 'primeng/dialog';
@Component({
    selector: 'app-estado-caja-chica',
    imports: [TableModule, CommonModule,ToastModule,ButtonModule, MatIconModule, DialogModule,
      FormsModule,DatePicker,InputTextModule],
    templateUrl: './estado-caja-chica.component.html',
    styleUrl: './estado-caja-chica.component.css',
    providers:[MessageService]
})
export class EstadoCajaChicaComponent implements OnInit, OnDestroy {
  documentosConRuta: CajaChica[] = [];
  selectedOption: any;
  loading: boolean = false;
  visible: boolean = false;
  pdfUrl: SafeResourceUrl | null = null;

  filtros: any = {
    numeroComprobante: '',
    documentoNombre: '',
    fechaInicio: null,
    comentario: '',
    comentarioCargador: '',
    estado: ''
  };

  private filtroChanged: Subject<void> = new Subject<void>();
  private filtroSubscription!: Subscription;

  constructor(
    private cajaChicaService: CajaChicaService,
    private messageService: MessageService,private cajaGeneralPRCService: CajaGeneralPRCService,private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.filtroSubscription = this.filtroChanged.pipe(
      debounceTime(500)
    ).subscribe(() => {
      this.cargarCajaChicaFiltrada();
    });

    this.cargarCajaChicaFiltrada();
  }

  ngOnDestroy() {
    this.filtroSubscription.unsubscribe();
  }

  onFiltroInput() {
    this.filtroChanged.next();
  }

  cargarCajaChicaFiltrada() {
    const sucursalId = Number(sessionStorage.getItem('sucursal'));

    const filtro: CajaChicaFiltroDto = {
      sucursalId: sucursalId,
      numeroComprobante: this.filtros.numeroComprobante,
      documentoNombre: this.filtros.documentoNombre,
      comentario: this.filtros.comentario,
      comentarioCargador: this.filtros.comentarioCargador,
      estado: this.filtros.estado,
      fechaInicio: this.filtros.fechaInicio
        ? new Date(this.filtros.fechaInicio).toISOString().split('T')[0]
        : undefined
    };

    this.cajaChicaService.obtenerCajaChicaFiltrado(filtro).subscribe({
      next: (respuesta) => {
        this.documentosConRuta = respuesta.datos;
      },
      error: (error) => {
        console.error('Error al cargar caja chica filtrada', error);
      }
    });
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
