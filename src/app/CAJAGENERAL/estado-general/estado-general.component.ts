import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { CajaGeneralService,CajaGeneral } from '../../Services/CajaGeneral/CajaGeneral.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-estado-general',
  standalone: true,
  imports: [TableModule, CommonModule, ToastModule],
  templateUrl: './estado-general.component.html',
  styleUrl: './estado-general.component.css',
  providers: [MessageService]
})
export class EstadoGeneralComponent implements OnInit {
  documentos: CajaGeneral[] = [];

  constructor(
    private cajaGeneralService: CajaGeneralService,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.cargarDocumentosConRuta();
  }

  cargarDocumentosConRuta() {
    this.cajaGeneralService.obtenerCajaGeneralConRutaArchivo().subscribe(
      (documentos) => {
        this.documentos = documentos;
        //console.log('Documentos cargados con ruta:', this.documentos);
      },
      (error) => {
        console.error('Error al cargar documentos con ruta:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar documentos con ruta.' });
      }
    );
  }
}
