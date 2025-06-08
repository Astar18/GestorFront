import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../assets/environment/environment';
export interface Sucursal {
  id: number;
  nombre: string;
}
export interface Perfil {
  id: number;
  tipoPerfil: string;
}
export interface Menu {
  id: number;
  nombreMenu: string;
  ruta: string;
  imagenRuta: string;
  descripcion: string;
}

@Injectable({
  providedIn: 'root',
})
export class ComboService {

  private apiUrl = `${environment.apiUrl}/combo`;


  constructor(private http: HttpClient) {}

  getSucursales(): Observable<Sucursal[]> {
    return this.http.get<Sucursal[]>(`${this.apiUrl}/sucursales`);
  }
  // Método para obtener los perfiles
  getPerfiles(): Observable<Perfil[]> {
    return this.http.get<Perfil[]>(`${this.apiUrl}/perfiles`);
  }
  getMenusByPerfil(): Observable<Menu[]> {
    if (typeof window !== 'undefined' && sessionStorage) {
      // Solo ejecuta este bloque si 'window' y 'sessionStorage' están definidos
      const perfilId = sessionStorage.getItem('perfilId');

      if (!perfilId) {
        return of([]); // Devuelve un Observable vacío si no hay perfilId
      }

      return this.http.get<Menu[]>(`${this.apiUrl}/menus/${perfilId}`);
    } else {
      // Manejo para entornos donde 'sessionStorage' no está disponible
      console.warn('sessionStorage no disponible. Devolviendo lista de menús vacía.');
      return of([]); // Devuelve un Observable vacío
    }
  }

}
