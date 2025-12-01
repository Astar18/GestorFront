import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ComboService,Sucursal,Perfil } from '../../Services/Combos/Combo.service';
import { UsuarioService, Usuario } from '../../Services/USER/Usuario.service';

@Component({
    selector: 'app-cuenta-user',
    imports: [FormsModule,ReactiveFormsModule,SelectModule,InputTextModule,PasswordModule,ButtonModule,CardModule,CheckboxModule,
    ],
    templateUrl: './cuenta-user.component.html',
    styleUrls: ['./cuenta-user.component.css']
})
export class CuentaUserComponent implements OnInit {
  sucursales: { label: string; value: number }[] = [];
  roles: { label: string; value: number }[] = [];

  cedula: string = '';
  identificacion: string = '';
  nombres: string = '';
  apellidos: string = '';
  sucursalId: number | undefined = undefined;
  rolId: number | undefined = undefined;
  correo: string = '';
  contrasena: string = '';

  constructor(private comboService: ComboService, private usuarioService: UsuarioService) { }

  ngOnInit() {
    this.loadSucursales();
    this.loadPerfiles();
  }

  loadSucursales() {
    this.comboService.getSucursales().subscribe(
      (sucursales: Sucursal[]) => {
        this.sucursales = sucursales.map(sucursal => ({
          label: sucursal.nombre,
          value: sucursal.id
        }));
      },
      (error) => {
        console.error('Error al cargar sucursales:', error);
      }
    );
  }

  loadPerfiles() {
    this.comboService.getPerfiles().subscribe(
      (perfiles: Perfil[]) => {
        this.roles = perfiles.map(perfil => ({
          label: perfil.tipoPerfil,
          value: perfil.id
        }));
      },
      (error) => {
        console.error('Error al cargar perfiles:', error);
      }
    );
  }

  crearUsuario() {
    if (!this.cedula || !this.nombres || !this.apellidos  || !this.rolId || !this.correo || !this.contrasena) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    const usuario: Usuario = {
      nombre: this.nombres,
      apellido: this.apellidos,
      cedula: this.cedula,
      sucursalId: this.sucursalId ?? 0,
      identificacion: this.identificacion,
      correo: this.correo,
      contraseña: this.contrasena,
      estadoCuenta: 'Activo',
      perfilId: this.rolId?? 0,
    };

    this.usuarioService.crearUsuario(usuario).subscribe(
      (response) => {
        console.log('Usuario creado:', response);
        alert('Usuario creado con éxito.');
        // Limpiar el formulario o realizar otras acciones necesarias
        this.cedula = '';
        this.identificacion = '';
        this.nombres = '';
        this.apellidos = '';
        this.sucursalId = undefined;
        this.rolId = undefined;
        this.correo = '';
        this.contrasena = '';
      },
      (error) => {
        console.error('Error al crear usuario:', error);
        alert('Error al crear usuario. Por favor, inténtelo de nuevo.');
      }
    );
  }
}
