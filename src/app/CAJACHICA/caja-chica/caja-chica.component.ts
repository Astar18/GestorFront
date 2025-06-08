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
import { CalendarModule } from 'primeng/calendar';
import { MatIcon } from '@angular/material/icon';
import { CajaChicaService,CajaChica } from '../../Services/CajaChica/caja-chica.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-caja-chica',
  imports: [
    ReactiveFormsModule, MatIconModule, IconFieldModule, SelectModule,ToastModule,ButtonModule,
    TableModule, FloatLabelModule, InputTextModule, DatePickerModule, MatIcon,
    FormsModule, InputIconModule, CommonModule, InputGroupModule
  ],
  templateUrl: './caja-chica.component.html',
  styleUrl: './caja-chica.component.css',
  providers: [MessageService] // Agrega MessageService a los providers
})
export class CajaChicaComponent implements OnInit {
  selectedOption: any; // Cambiado a 'any' para manejar el objeto completo
  date: Date | undefined;
  documentoNombre: string = '';
  numeroComprobante: string = '';
  nombreCargador: string = '';
  comentarioCargador:string = ''; // Nuevo campo
  documentosPendientes: CajaChica[] = [];
  selectedFile: File | null = null;
  selectedDocumento: CajaChica | null = null;
  opciones: any[] = [
    { nombre: 'Caja', valor: 1 }
  ];

  constructor(private cajaChicaService: CajaChicaService, private messageService: MessageService) { } // Inyecta el servicio

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
    if (
      !this.selectedOption ||
      !this.date ||
      !this.documentoNombre ||
      !this.numeroComprobante // Checks if it's not empty/null/undefined
      // If you specifically want to enforce a minimum of 1 digit and that it's purely digits:
      // || !/^\d+$/.test(this.numeroComprobante) // Checks if it contains only digits and at least one
    ) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Por favor, complete todos los campos y asegúrese que el número de comprobante es válido.' });
      return;
    }

    // Also, ensure it's not longer than 7 characters here if maxlength could be bypassed
    if (this.numeroComprobante.length > 7) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El número de comprobante no puede exceder los 7 dígitos.' });
        return;
    }


    const nuevoRegistro: CajaChica = {
      id: 0,
      documentoNombre: `${this.selectedOption.nombre}_${this.documentoNombre}`,
      sucursalId: 0,
      fechaCreacion: this.date.toISOString(),
      cargadorId: 0, // Ajusta según tu lógica
      ingresadoPor: 0, // Ajusta según tu lógica
      numeroComprobante: this.numeroComprobante,
      estado: '', // Este valor se reemplazará en el servicio
      comentarioCargador: this.comentarioCargador
    };

    this.cajaChicaService.crearCajaChica(nuevoRegistro).subscribe(
      (respuesta) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro creado correctamente.' });
        this.selectedOption = null;
        this.date = undefined;
        this.documentoNombre = '';
        this.numeroComprobante = '';
        this.nombreCargador = '';
        this.comentarioCargador = '';
        this.cargarDocumentosPendientes(); // Actualiza la tabla
      },
      (error) => {
        console.error('Error al crear registro:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear el registro.' });
      }
    );
  }
  cargarDocumentosPendientes() {

      this.cajaChicaService.obtenerCajaChicaPorSucursalIdPendienteSinRuta().subscribe(
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
  onFileSelected(event: any, documento: CajaChica) {
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
  formData.append('file', this.selectedFile, this.selectedFile.name); // Agrega el nombre del archivo

  // Verifica el contenido del FormData
  for (const pair of formData.entries()) {
      console.log(pair[0] + ', ' + pair[1]);
  }

  this.cajaChicaService.cargarArchivoCajaChica(this.selectedDocumento.id, this.selectedDocumento.sucursalId, formData).subscribe(
    (rutaArchivo) => {
        if (rutaArchivo) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Archivo cargado correctamente.' });
            this.cargarDocumentosPendientes(); // Actualiza la tabla
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
