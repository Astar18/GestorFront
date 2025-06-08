import { Component, OnInit } from '@angular/core';
import { PerfilConSucursales, PerfilSucursalService } from '../../Services/PerfilSucursal/PerfilSucursal.service';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
@Component({
  selector: 'app-usuario-sucursales',
  imports: [CommonModule, TableModule,TooltipModule],
  templateUrl: './usuario-sucursales.component.html',
  styleUrl: './usuario-sucursales.component.css',
  providers: [MessageService],
})
export class UsuarioSucursalesComponent implements OnInit {

  perfilesConSucursales: PerfilConSucursales[] = [];

    constructor(private perfilSucursalService: PerfilSucursalService, private messageService: MessageService) { }

    ngOnInit(): void {
        this.cargarPerfilesConSucursales();

    }
    cargarPerfilesConSucursales(): void {
      this.perfilSucursalService.obtenerPerfilesConNombresDeSucursales().subscribe(
        (data) => {
          // Ordena: primero todos menos Admin/SuperAdmin, luego los Admin/SuperAdmin
          this.perfilesConSucursales = [
            ...data.filter(p => p.tipoPerfil !== 'Administrador' && p.tipoPerfil !== 'SuperAdmin'),
            ...data.filter(p => p.tipoPerfil === 'Administrador' || p.tipoPerfil === 'SuperAdmin')
          ];
        },
        (error) => {
          console.error('Error al obtener los perfiles con sucursales:', error);
        }
      );
    }






}
