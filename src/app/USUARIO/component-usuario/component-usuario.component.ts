import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from '../../Services/USER/Usuario.service';
import { MessageService, TreeNode } from 'primeng/api';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import {ToastModule} from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ComboService } from '../../Services/Combos/Combo.service';
import { CommonModule } from '@angular/common';
import { TreeSelectModule } from 'primeng/treeselect';

interface Sucursal {
  id: number;
  nombre: string;
}
interface Perfil {
  id: number;
  tipoPerfil: string;
}
@Component({
  selector: 'app-component-usuario',
  standalone: true,
  imports: [DropdownModule,ToastModule,InputTextModule,CommonModule,TreeSelectModule,
    PasswordModule,ButtonModule,CardModule,ReactiveFormsModule],
  templateUrl: './component-usuario.component.html',
  styleUrl: './component-usuario.component.css',
  providers: [MessageService]
})
export class ComponentUsuarioComponent implements OnInit {
  usuarioForm: FormGroup;
  sucursalForm: FormGroup;
  sucursales: TreeNode[] = [];
  perfiles: TreeNode[] = [];
  estadosUsuario: TreeNode[] = [];

  estadosUser() {
    this.estadosUsuario = ['Activo', 'Inactivo', 'Suspendido'].map(estado => ({
      label: estado,
      data: estado
    }));
  }



  constructor(
    private fb: FormBuilder,private comboService: ComboService,
    private usuarioService: UsuarioService,
    private messageService: MessageService
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      cedula: ['', Validators.required],
      sucursalId: ['', Validators.required],
      identificacion: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contraseña: ['', Validators.required],
      estadoCuenta: ['', Validators.required],
      perfilId: ['', Validators.required]
    });
    this.sucursalForm = this.fb.group({
      sucursal: [null],
    });
  }
  ngOnInit() {
  this.ObtenerSucursales();
  this.estadosUser();
  this.ObtenerPerfiles();
  }


  crearUsuario() {
    if (this.usuarioForm.valid) {
      const formValue = this.usuarioForm.value;
      formValue.estadoCuenta = formValue.estadoCuenta ? formValue.estadoCuenta.data : null;
      formValue.sucursalId = formValue.sucursalId ? formValue.sucursalId.data : null;
      formValue.perfilId = formValue.perfilId ? formValue.perfilId.data : null;
      this.usuarioService.crearUsuario(formValue).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado correctamente' });
          this.usuarioForm.reset();
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el usuario' });
        }
      });
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Complete todos los campos' });
    }
  }

  ObtenerSucursales(){
    this.comboService.getSucursales().subscribe((data: Sucursal[]) => {
      this.sucursales = data.map(sucursal => ({
        label: sucursal.nombre,
        data: sucursal.id
      }));
    });
  }
  ObtenerPerfiles() {
    this.comboService.getPerfiles().subscribe((data: Perfil[]) => {
      this.perfiles = data.map(perfil => ({
        label: perfil.tipoPerfil,
        data: perfil.id
      }));
    });
  }


}
