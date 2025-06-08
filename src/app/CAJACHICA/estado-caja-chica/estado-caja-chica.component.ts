import { MessageService } from 'primeng/api';
import { CajaChica, CajaChicaService } from './../../Services/CajaChica/caja-chica.service';
import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';

@Component({
    selector: 'app-estado-caja-chica',
    imports: [TableModule, CommonModule,ToastModule],
    templateUrl: './estado-caja-chica.component.html',
    styleUrl: './estado-caja-chica.component.css',
    providers:[MessageService]
})
export class EstadoCajaChicaComponent implements OnInit {
  documentosConRuta: CajaChica[] = [];
  selectedOption: any;
  constructor(
    private cajaChicaService: CajaChicaService,
    private messageService: MessageService
  ){}
  ngOnInit() {

    this.cargarDocumentosConRuta();
  }



  cargarDocumentosConRuta() {

      this.cajaChicaService.obtenerCajaChicaConRutaArchivo().subscribe(
        (documentos) => {
          this.documentosConRuta = documentos;
          console.log('Documentos con ruta cargados:', documentos);
        },
        (error) => {
          console.error('Error al cargar documentos con ruta:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar documentos con ruta.' });
        }
      );

  }

}
