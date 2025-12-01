import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../assets/environment/environment';

// DTOs e Interfaces
export interface AreaDto {
  id?: number;
  nombre: string;
  codigo?: string;
  estado?: boolean;
}

export interface IdRequest {
  id: number;
}

export interface FiltroAreaRequest {
  nombre?: string;
  codigo?: string;
  estado?: boolean;
  pagina: number;
  registrosPorPagina: number;
}

export interface ListarAreasResponse {
  areas: AreaDto[];
  totalRegistros: number;
  pagina: number;
  registrosPorPagina: number;
  totalPaginas: number;
}

@Injectable({
  providedIn: 'root'
})
export class AreaService {
  private readonly apiUrl = `${environment.backFacturasUrl}/Areas`;

  constructor(private readonly http: HttpClient) { }

  /**
   * Crear una nueva área
   */
  crearArea(dto: AreaDto): Observable<AreaDto> {
    return this.http.post<AreaDto>(`${this.apiUrl}/crear-area`, dto);
  }

  /**
   * Editar un área existente
   */
  editarArea(dto: AreaDto): Observable<AreaDto> {
    return this.http.post<AreaDto>(`${this.apiUrl}/editar-area`, dto);
  }

  /**
   * Eliminar un área
   */
  eliminarArea(id: number): Observable<{ mensaje: string }> {
    const request: IdRequest = { id };
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/eliminar-area`, request);
  }

  /**
   * Listar áreas con paginación y filtros
   */
  listarAreas(request: FiltroAreaRequest): Observable<ListarAreasResponse> {
    return this.http.post<ListarAreasResponse>(`${this.apiUrl}/listar-areas`, request);
  }
}
