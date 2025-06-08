import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import { ComboService, Menu } from '../../Services/Combos/Combo.service';
@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, MatIconModule],
    templateUrl: './menu.component.html',
    styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  menuItems: Menu[] = [];

  constructor(private router: Router, private comboService: ComboService) { } // Inyecta ComboService

  ngOnInit() {
    this.loadMenus();
  }

  loadMenus() {
    this.comboService.getMenusByPerfil().subscribe(
      (menus) => {
        // Filtra los menús para excluir el menú con id = 1
        this.menuItems = menus.filter(menu => menu.id !== 1);
      },
      (error) => {
        console.error('Error al cargar menús:', error);
      }
    );
  }


  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
