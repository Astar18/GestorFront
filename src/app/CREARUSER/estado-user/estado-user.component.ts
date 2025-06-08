import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { UsuarioService, Usuario } from '../../Services/USER/Usuario.service';
import { HttpClient } from '@angular/common/http'; // Importa el HttpClient
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';


@Component({
  selector: 'app-estado-user',
  imports: [TableModule, CommonModule, ButtonModule, DialogModule, InputTextModule, FormsModule, ToastModule,SelectModule],
  templateUrl: './estado-user.component.html',
  styleUrl: './estado-user.component.css',
  providers: [MessageService]
})
export class EstadoUserComponent implements OnInit {
  usuarios: Usuario[] = [];
  mostrarDialogCambiarContrasena: boolean = false;
  usuarioSeleccionadoId: number | null = null;
  nuevaContrasena: string = '';
  sucursales: { id: number; codigoSucursal: string; nombre: string }[] = [];
  perfiles: { id: number; tipoPerfil: string }[] = [];
  filtro: any = {
    nombre: '',
    cedula: '',
    correo: '',
    estadoCuenta: '',
    sucursalId: null,
    perfilId: null
  };

  constructor(private usuarioService: UsuarioService, private http: HttpClient, private messageService: MessageService) { }

  ngOnInit() {
    this.obtenerUsuarios();
  this.obtenerCatalogos();
  }

  obtenerUsuarios() {
    this.usuarioService.obtenerUsuarios().subscribe(
      (usuarios) => {
        this.usuarios = usuarios;
      },
      (error) => {
        console.error('Error al obtener usuarios:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al obtener usuarios.' });
      }
    );
  }
  filtrarUsuarios() {
    this.usuarioService.filtrarUsuarios(this.filtro).subscribe(
      (usuarios) => {
        this.usuarios = usuarios;
      },
      (error) => {
        console.error('Error al filtrar usuarios:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al filtrar usuarios.' });
      }
    );
  }

  obtenerCatalogos() {
    this.usuarioService.obtenerCatalogosUsuario().subscribe(
      (data) => {
        this.sucursales = data.sucursales;
        this.perfiles = data.perfiles;
      },
      (error) => {
        console.error('Error al obtener catálogos:', error);
      }
    );
  }

  cambiarEstado(usuarioId: number, estadoActual: string) {
    const nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';

    // Envía solo el valor del nuevo estado en formato JSON
    this.usuarioService.actualizarEstadoCuenta(usuarioId, `"${nuevoEstado}"`).subscribe(
      (response) => {
        console.log('Estado de cuenta actualizado:', response);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Estado de cuenta actualizado.' });
        this.obtenerUsuarios(); // Recarga los usuarios para actualizar la tabla
      },
      (error) => {
        console.error('Error al actualizar el estado de la cuenta:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el estado de la cuenta.' });
      }
    );
  }

  abrirDialogCambiarContrasena(usuarioId: number) {
    this.usuarioSeleccionadoId = usuarioId;
    this.nuevaContrasena = '';
    this.mostrarDialogCambiarContrasena = true;
  }

  guardarNuevaContrasena() {
    if (this.usuarioSeleccionadoId && this.nuevaContrasena) {
      this.usuarioService.cambiarContrasena(this.usuarioSeleccionadoId, this.nuevaContrasena).subscribe(
        (response) => {
          console.log('Contraseña actualizada:', response);
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Contraseña actualizada correctamente.' });
          this.mostrarDialogCambiarContrasena = false;
          this.usuarioSeleccionadoId = null;
          this.nuevaContrasena = '';
        },
        (error) => {
          console.error('Error al actualizar la contraseña:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar la contraseña.' });
        }
      );
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor, ingrese la nueva contraseña.' });
    }
  }

  cerrarDialogCambiarContrasena() {
    this.mostrarDialogCambiarContrasena = false;
    this.usuarioSeleccionadoId = null;
    this.nuevaContrasena = '';
  }
}
