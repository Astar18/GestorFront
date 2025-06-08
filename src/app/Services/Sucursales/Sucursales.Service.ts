import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../assets/environment/environment';

export interface Sucursal {
  id?: number;
  codigoSucursal: string;
  nombre: string;
}

@Injectable({
  providedIn: 'root'
})
export class SucursalesService {
  private apiUrl = `${environment.apiUrl}/Sucursal`; // Ajusta la ruta si es necesario

  constructor(private http: HttpClient) { }

  getAllSucursales(): Observable<Sucursal[]> {
    return this.http.get<Sucursal[]>(this.apiUrl);
  }
  getSucursalById(id: number): Observable<Sucursal> {
    return this.http.get<Sucursal>(`${this.apiUrl}/${id}`);
  }

  createSucursal(sucursal: Sucursal): Observable<Sucursal> {
    return this.http.post<Sucursal>(this.apiUrl, sucursal);
  }
  updateSucursal(sucursal: Sucursal): Observable<Sucursal> {
    return this.http.put<Sucursal>(`${this.apiUrl}/${sucursal.id}`, sucursal);
  }
}
