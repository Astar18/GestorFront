import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Usuario, UsuarioService } from '../../Services/USER/Usuario.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
@Component({
    selector: 'app-login',
    imports: [CardModule, PasswordModule, CheckboxModule, InputTextModule, ButtonModule,
      ToastModule,CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    providers: [MessageService],
})
export class LoginComponent {
  username = '';
  password = '';
  rememberMe = false;
  logoPath = '/././dilipaUserLogin.png';

  constructor(private usuarioService: UsuarioService, private router: Router, private messageService: MessageService) { } // Inyecta MessageService

  onSubmit() {
    this.usuarioService.iniciarSesion(this.username, this.password).subscribe(
      (usuario: Usuario) => {
        // Inicio de sesión exitoso
        console.log('Inicio de sesión exitoso:', usuario);

        if (usuario.estadoCuenta === 'Inactivo') {
          // Cuenta inactiva
          this.messageService.add({ severity: 'error', summary: 'Cuenta Inactiva', detail: 'Tu cuenta está desactivada. Contacta al administrador.' });
        } else {
          // Cuenta activa
          sessionStorage.setItem('perfilId', usuario.perfilId.toString());
          sessionStorage.setItem('usuarioId', usuario.id?.toString() || '');
          sessionStorage.setItem('firmaHmac', usuario.firmaHmac || '');
          sessionStorage.setItem('Nombres', `${usuario.nombre} ${usuario.apellido}`);
          sessionStorage.setItem('sucursal', usuario.sucursalId.toString());

          // Redirigir a la página principal o al dashboard
          this.router.navigate(['/menu']);
        }
      },
      (error) => {
        // Manejo de errores
        console.error('Error al iniciar sesión:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Correo o contraseña incorrectos.' });
      }
    );
  }
}
