import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../assets/environment/environment';

// ========== DTOs e Interfaces ==========

export interface ProductoDto {
  id?: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  precio?: number; // Del backend
  precioUnitario?: number; // Para uso interno
  unidadMedida?: string;
  categoria?: string;
  stock?: number;
  stockMinimo?: number;
  estado?: string;
}

export interface IdRequest {
  id: number;
}

export interface FiltroProductoRequest {
  pagina: number;
  registrosPorPagina: number;
  nombre?: string;
  codigo?: string;
  categoria?: string;
  estado?: string;
}

export interface ListarProductosResponse {
  productos: ProductoDto[];
  totalRegistros: number;
  pagina: number;
  registrosPorPagina: number;
  totalPaginas: number;
}

// ========== Servicio ==========

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.backFacturasUrl}/Productos`;

  /**
   * Crear un nuevo producto
   */
  crearProducto(dto: ProductoDto): Observable<ProductoDto> {
    return this.http.post<ProductoDto>(`${this.apiUrl}/crear-producto`, dto);
  }

  /**
   * Editar un producto existente
   */
  editarProducto(dto: ProductoDto): Observable<ProductoDto> {
    return this.http.post<ProductoDto>(`${this.apiUrl}/editar-producto`, dto);
  }

  /**
   * Eliminar un producto
   */
  eliminarProducto(id: number): Observable<{ mensaje: string }> {
    const request: IdRequest = { id };
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/eliminar-producto`, request);
  }

  /**
   * Listar productos con paginación y filtros
   * Nota: Este endpoint debe ser agregado en el backend
   */
  listarProductos(request: FiltroProductoRequest): Observable<ListarProductosResponse> {
    return this.http.post<ListarProductosResponse>(`${this.apiUrl}/listar-productos`, request);
  }
}
