import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../assets/environment/environment';
import { Observable } from 'rxjs';

// --- MODELOS ---
export interface ProveedorDto {
  id: number;
  razonSocial: string;
  nombreComercial?: string;
  identificacion: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  estado: string;
}

export interface IdRequest {
  id: number;
}

// ESTA INTERFAZ DEBE COINCIDIR CON TU C# "FiltroProveedorRequest"
export interface FiltroProveedorRequest {
  pagina: number;
  registrosPorPagina: number;
  razonSocial?: string;
  nombreComercial?: string;
  identificacion?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  estado?: string;
}

// Modelo de respuesta del Backend
export interface PaginadoResponse {
  proveedores: ProveedorDto[];
  totalRegistros: number;
  pagina: number;
  registrosPorPagina: number;
  totalPaginas: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.backFacturasUrl}/Proveedor`;

  getAllPaginado(request: FiltroProveedorRequest): Observable<PaginadoResponse> {
    return this.http.post<PaginadoResponse>(`${this.apiUrl}/listar-proveedores`, request);
  }

  create(dto: ProveedorDto): Observable<ProveedorDto> {
    return this.http.post<ProveedorDto>(`${this.apiUrl}/crear-proveedor`, dto);
  }

  update(dto: ProveedorDto): Observable<ProveedorDto> {
    return this.http.post<ProveedorDto>(`${this.apiUrl}/editar-proveedor`, dto);
  }

  delete(id: number): Observable<any> {
    const request: IdRequest = { id };
    return this.http.post(`${this.apiUrl}/eliminar-proveedor`, request);
  }
}