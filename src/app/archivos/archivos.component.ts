import { Component } from '@angular/core';
import {TableModule} from 'primeng/table';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
@Component({
    selector: 'app-archivos',
    standalone: true,
    imports: [TableModule, CommonModule, MatIconModule],
    templateUrl: './archivos.component.html',
    styleUrl: './archivos.component.css'
})
export class ArchivosComponent {
  data = [
    { politicas: 'Política de Privacidad', noticia: 'Actualización 2025'},
    { politicas: 'Términos y Condiciones', noticia: 'Revisión Anual' },
    { politicas: 'Código de Ética', noticia: 'Nueva Versión' },
  ];

  download(row: any): void {
    console.log('Descargando:', row);
    // Implementar lógica de descarga
  }
}
