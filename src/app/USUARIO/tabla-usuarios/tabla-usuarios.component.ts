import { Component } from '@angular/core';
import { UsuarioService } from '../../Services/USER/Usuario.service';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-tabla-usuarios',
  standalone: true,
  imports: [CommonModule,TableModule],
  templateUrl: './tabla-usuarios.component.html',
  styleUrl: './tabla-usuarios.component.css'
})
export class TablaUsuariosComponent {
  usuarios: any[] = [];

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit() {
    this.obtenerUsuarios();
  }

  obtenerUsuarios() {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;

      },
      error: (err) => {
        console.error('Error al obtener usuarios', err);
      }
    });
  }
}
