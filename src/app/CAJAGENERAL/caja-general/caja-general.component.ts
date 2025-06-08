import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TableModule } from 'primeng/table';
import { MatIconModule } from '@angular/material/icon';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MatIcon } from '@angular/material/icon';
import { CajaGeneralService,CajaGeneral } from '../../Services/CajaGeneral/CajaGeneral.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-caja-general',
  imports: [
    ReactiveFormsModule, MatIconModule, IconFieldModule, SelectModule, ToastModule,ButtonModule,
    TableModule, FloatLabelModule, InputTextModule, DatePickerModule, MatIcon,
    FormsModule, InputIconModule, CommonModule, InputGroupModule
  ],
  templateUrl: './caja-general.component.html',
  styleUrl: './caja-general.component.css',
  providers: [MessageService]
})
export class CajaGeneralComponent implements OnInit {
  selectedOption: any;
  date: Date | undefined;
  documentoNombre: string = '';
  numeroComprobante: string = '';
  nombreCargador: string = '';
  comentarioCargador:string = ''; // Nuevo campo
  documentosPendientes: CajaGeneral[] = [];
  selectedFile: File | null = null;
  selectedDocumento: CajaGeneral | null = null;
  opciones: any[] = [
    { nombre: 'Caja', valor: 1 }
  ];

  constructor(private cajaGeneralService: CajaGeneralService, private messageService: MessageService) { }

  ngOnInit() {
    this.cargarDocumentosPendientes();
  }
  onNumeroComprobanteInput(event: Event): void {
    let input = (event.target as HTMLInputElement).value;
    // Remove non-digit characters
    input = input.replace(/\D/g, '');
    // Truncate to 7 digits if it exceeds
    if (input.length > 7) {
      input = input.substring(0, 7);
    }
    this.numeroComprobante = input;
  }

  crearRegistro() {
    if (!this.selectedOption || !this.date || !this.documentoNombre || !this.numeroComprobante ) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Por favor, complete todos los campos.' });
      return;
    }

    const nuevoRegistro: CajaGeneral = {
      id: 0,
      nombreDocumento: `${this.selectedOption.nombre}_${this.documentoNombre}`,
      sucursalId: 0,
      fechaCreacion: this.date.toISOString(),
      cargadorId: 0,
      ingresadoPor: 0,
      numeroComprobante: this.numeroComprobante,
      estado: '',
      rutaArchivo: '',
      comentario: '',
      comentarioCargador: this.comentarioCargador
    };

    this.cajaGeneralService.crearCajaGeneral(nuevoRegistro).subscribe(
      (respuesta) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro creado correctamente.' });
        this.selectedOption = null;
        this.date = undefined;
        this.documentoNombre = '';
        this.numeroComprobante = '';
        this.comentarioCargador = ''; // Limpiar comentario después de crear el registro
        this.cargarDocumentosPendientes();
      },
      (error) => {
        console.error('Error al crear registro:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear el registro.' });
      }
    );
}


  cargarDocumentosPendientes() {
    this.cajaGeneralService.obtenerCajaGeneralPorSucursalIdPendienteSinRuta().subscribe(
      (documentos) => {
        this.documentosPendientes = documentos;
        //console.log('Documentos pendientes cargados:', this.documentosPendientes);
      },
      (error) => {
        console.error('Error al cargar documentos pendientes:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar documentos pendientes.' });
      }
    );
  }

  onFileSelected(event: any, documento: CajaGeneral) {
    this.selectedFile = event.target.files[0];
    this.selectedDocumento = documento;
    this.uploadFile();
  }

  uploadFile() {
    if (!this.selectedFile || !this.selectedDocumento) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Seleccione un archivo.' });
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    this.cajaGeneralService.cargarArchivoCajaGeneral(this.selectedDocumento.id, this.selectedDocumento.sucursalId, formData).subscribe(
      (rutaArchivo) => {
        if (rutaArchivo) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Archivo cargado correctamente.' });
          this.cargarDocumentosPendientes();
          window.location.reload();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el archivo.' });
        }
      },
      (error) => {
        console.error('Error al cargar el archivo:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el archivo.' });
      }
    );
  }
}
