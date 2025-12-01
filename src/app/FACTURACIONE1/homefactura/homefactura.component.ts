import { Component } from '@angular/core';
import { NavbarComponent } from '../../Shared/navbar/navbar.component';
import { SkeletonfacturaComponent } from '../skeletonfactura/skeletonfactura.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-homefactura',
  imports: [NavbarComponent,SkeletonfacturaComponent, CommonModule],
  templateUrl: './homefactura.component.html',
  styleUrl: './homefactura.component.css',
})
export class HomefacturaComponent {

}
