import { Component, OnInit } from '@angular/core';
import { SucursalesService,Sucursal } from '../../Services/Sucursales/Sucursales.Service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-sucursales',
  imports: [TableModule, ButtonModule, InputTextModule, FormsModule, ToastModule, DialogModule, CommonModule],
  templateUrl: './sucursales.component.html',
  styleUrl: './sucursales.component.css',
  providers: [MessageService]
})
export class SucursalesComponent implements OnInit {
  sucursales: Sucursal[] = [];
  nuevaSucursal: Sucursal = { codigoSucursal: '', nombre: '' };
  sucursalSeleccionada: Sucursal = { id: 0, codigoSucursal: '', nombre: '' }; // Para la edición
  mostrarDialogCrear: boolean = false;
  mostrarDialogEditar: boolean = false;

  constructor(private sucursalesService: SucursalesService, private messageService: MessageService) { }

  ngOnInit(): void {
    this.cargarSucursales();
  }

  cargarSucursales(): void {
    this.sucursalesService.getAllSucursales().subscribe(
      (data) => {
        this.sucursales = data;
      },
      (error) => {
        console.error('Error al cargar las sucursales:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las sucursales.' });
      }
    );
  }

  abrirDialogCrear(): void {
    this.nuevaSucursal = { codigoSucursal: '', nombre: '' };
    this.mostrarDialogCrear = true;
  }

  crearSucursal(): void {
    this.sucursalesService.createSucursal(this.nuevaSucursal).subscribe(
      (data) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Sucursal creada correctamente.' });
        this.mostrarDialogCrear = false;
        this.cargarSucursales(); // Recargar la lista de sucursales
      },
      (error) => {
        console.error('Error al crear la sucursal:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear la sucursal.' });
      }
    );
  }

  abrirDialogEditar(sucursal: Sucursal): void {
    this.sucursalSeleccionada = { ...sucursal }; // Crear una copia para no modificar la tabla directamente
    this.mostrarDialogEditar = true;
  }

  editarSucursal(): void {
    this.sucursalesService.updateSucursal(this.sucursalSeleccionada).subscribe(
      (data) => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Sucursal actualizada correctamente.' });
        this.mostrarDialogEditar = false;
        this.cargarSucursales(); // Recargar la lista de sucursales
      },
      (error) => {
        console.error('Error al editar la sucursal:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al editar la sucursal.' });
      }
    );
  }
}
