import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../assets/environment/environment';

export interface Perfil {
  id: number;
  tipoPerfil: string;
}
export interface Sucursal {
  id: number;
  codigoSucursal: string;
  nombre: string;
}
export interface PerfilSucursal {
  id: number;
  perfilId: number;
  sucursalId: number;
}
export interface PerfilConSucursales {
  perfilId: number;
  tipoPerfil: string;
  sucursales: SucursalInfo[];
}

export interface SucursalInfo {
  sucursalId: number;
  nombreSucursal: string;
}
@Injectable({
  providedIn: 'root'
})
export class PerfilSucursalService {
  private apiUrl = `${environment.apiUrl}/perfilSucursal`;

  constructor(private http: HttpClient) {}

  // Obtener todos los perfiles
  obtenerPerfiles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/perfiles`);
  }

  // Obtener todas las sucursales
  obtenerSucursales(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sucursales`);
  }

  // Crear un nuevo perfil
  crearPerfil(tipoPerfil: string): Observable<any> {
    const body = { tipoPerfil }; // JSON correcto
    return this.http.post<any>(`${this.apiUrl}/crearPerfil`, body, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Asignar sucursales a un perfil
  asignarSucursales(perfilId: number, sucursalIds: number[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/asignarSucursales`, { perfilId, sucursalIds });
  }

  obtenerPerfilesConSucursales(): Observable<Perfil[]> {
    return this.http.get<Perfil[]>(`${this.apiUrl}/perfiles-con-sucursales`);
  }
  obtenerSucursalPerfilEditar(perfilId: number): Observable<PerfilSucursal[]> {
    return this.http.get<PerfilSucursal[]>(`${this.apiUrl}/sucursalPerfilEditar/${perfilId}`);
  }
  asignarSucursalesE(perfilId: number, sucursalIds: number[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/asignarSucursalesE`, { perfilId, sucursalIds });
  }
  obtenerPerfilesConNombresDeSucursales(): Observable<PerfilConSucursales[]> {
    return this.http.get<PerfilConSucursales[]>(`${this.apiUrl}/perfilesConSucursalesNombres`);
}


}
