import { Component, OnInit } from '@angular/core';
import { PerfilSucursalService,Perfil,Sucursal,PerfilSucursal } from '../../Services/PerfilSucursal/PerfilSucursal.service';
import { FormsModule,ReactiveFormsModule  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-perfil-usuario',
  imports: [FormsModule, CommonModule,ButtonModule,InputText,TableModule,CheckboxModule,
    SelectModule,MultiSelectModule,ToastModule,ReactiveFormsModule,MatIcon],
  templateUrl: './perfil-usuario.component.html',
  styleUrl: './perfil-usuario.component.css',
  providers: [MessageService],
})
export class PerfilUsuarioComponent implements OnInit {
  perfiles: any[] = [];
  perfilesCS: Perfil[] = [];
  sucursales: Sucursal[] = [];
  nuevoPerfil = 'Procesador';
  sucursalesPerfil: PerfilSucursal[] = [];
  nuevoPerfilSufijo = '';
  nuevoPerfilSufijo2: string = '';
  sucursalesSeleccionadas: number[] = [];
  perfilSeleccionado: Perfil | null = null;
  sucursalesCheckeadas: { [key: number]: string } = {};


  constructor(private perfilSucursalService: PerfilSucursalService,private messageService:MessageService) {}

  ngOnInit(): void {
    this.cargarPerfiles();
    this.cargarSucursales();
    this.cargarPerfilesE();
  }

  cargarPerfiles() {
    this.perfilSucursalService.obtenerPerfiles().subscribe(data => {
      this.perfiles = data;
    });
  }

  cargarSucursales() {
    this.perfilSucursalService.obtenerSucursales().subscribe(data => {
      this.sucursales = data;
    });
  }

  crearPerfil() {
    const perfilCompleto = `${this.nuevoPerfil}_${this.nuevoPerfilSufijo.trim()}_${this.nuevoPerfilSufijo2.trim()}`;
    if (perfilCompleto.trim()) {
      this.perfilSucursalService.crearPerfil(perfilCompleto).subscribe(() => {
        this.nuevoPerfilSufijo = '';
        this.nuevoPerfilSufijo2 = '';
        this.cargarPerfiles();
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Perfil Creado Correctamente.' });
      });
    }
  }

  asignarSucursales() {
    if (this.perfilSeleccionado && this.sucursalesSeleccionadas.length > 0) {
      this.perfilSucursalService.asignarSucursales(this.perfilSeleccionado.id, this.sucursalesSeleccionadas).subscribe(response => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Sucursales asignadas correctamente.' });
        this.cargarSucursales();
        this.cargarPerfiles();
      }, error => {
        console.error('Error al asignar sucursales', error);
      });
    } else {
      this.messageService.add({ severity: 'info', summary: 'Información', detail: 'Selecciona un perfil al menos.' });
    }
  }

   // Cargar los perfiles con sucursales asignadas
   cargarPerfilesE(): void {
    this.perfilSucursalService.obtenerPerfilesConSucursales().subscribe(
      (data) => {
        this.perfilesCS = data;

      },
      (error) => {
        console.error('Error al obtener los perfiles:', error);
      }
    );
  }
  cargarSucursalesPerfil(perfilId: number): void {
    this.perfilSucursalService.obtenerSucursalPerfilEditar(perfilId).subscribe(
        (data) => {
            this.sucursalesPerfil = data;
            this.sucursalesCheckeadas = {};

            // Marcar los inputs con "X" según las sucursales asignadas
            this.sucursales.forEach(sucursal => {
                this.sucursalesCheckeadas[sucursal.id] = this.sucursalesPerfil.some(sp => sp.sucursalId === sucursal.id) ? 'X' : '';
            });
        },
        (error) => {
            console.error('Error al obtener las sucursales del perfil:', error);
        }
    );
}
actualizarSucursalesPerfil(): void {
  if (this.perfilSeleccionado) {
      const sucursalesIds = Object.keys(this.sucursalesCheckeadas)
          .filter(key => this.sucursalesCheckeadas[Number(key)] === 'X' || this.sucursalesCheckeadas[Number(key)] === 'x')
          .map(Number);

      this.perfilSucursalService.asignarSucursalesE(this.perfilSeleccionado.id, sucursalesIds).subscribe(() => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Sucursales del perfil actualizadas correctamente.' });
          this.cargarPerfilesE();
          this.cargarPerfiles();
          if (this.perfilSeleccionado) {
              this.cargarSucursalesPerfil(this.perfilSeleccionado.id);
          }
      });
  }
}

onPerfilChange(): void {
  if (this.perfilSeleccionado) {
      this.cargarSucursalesPerfil(this.perfilSeleccionado.id);
  }
}






}

