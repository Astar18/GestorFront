import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { ComboService,Menu } from '../../Services/Combos/Combo.service';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-navbar',
  imports: [Menubar, BadgeModule, AvatarModule, InputTextModule, CommonModule,DrawerModule,ButtonModule,MatIcon],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  visible: boolean = false;
  menus: Menu[] = [];
  nombreUsuario: string = '';

  constructor(private comboService: ComboService, private router: Router) { } // Inyecta Router

  ngOnInit() {
    this.loadMenus();
    if (typeof window !== 'undefined' && sessionStorage) {
      this.nombreUsuario = sessionStorage.getItem('Nombres') || '';
    } else {
      console.warn('sessionStorage no disponible en este entorno.');
    }
  }

  loadMenus() {
    this.comboService.getMenusByPerfil().subscribe(
      (menus) => {
        // Filtra los menús para excluir el menú con id = 1
        this.menus = menus.filter(menu => menu.id !== 7);

      },
      (error) => {
        console.error('Error al cargar menús:', error);
      }
    );
  }

  navigateTo(ruta: string) {
    this.router.navigate([ruta]);
  }
  cerrarSesion() {
    sessionStorage.clear(); // Borra todo el sessionStorage
    this.router.navigate(['/login']); // Redirige al login
  }
}

