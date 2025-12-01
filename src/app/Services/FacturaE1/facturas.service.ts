import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../assets/environment/environment';

// ========== DTOs e Interfaces ==========

export interface FacturaCreateUpdateDto {
  clienteId: number;
  areaId: number;
  sucursalId: number;
  numeroFactura: string;
  fechaEmision: string; // ISO format
  fechaVencimiento?: string; // ISO format
  subtotal: number;
  iva: number;
  totalConIva: number;
  valorRetencion?: number;
  totalFinal: number;
  observaciones?: string;
  estado?: string;
  responsableId?: number;
  detalles?: FacturaDetalleDto[];
}

export interface FacturaDetalleDto {
  id?: number;
  productoId?: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface UpdateRequest<T> {
  id: number;
  data: T;
}

export interface IdRequest {
  id: number;
}

export interface CambioEstadoRequest {
  facturaId: number;
  nuevoEstado: string;
  usuarioId: number;
  comentario?: string;
}

export interface AsignarResponsableRequest {
  facturaId: number;
  responsableId: number;
}

export interface ActualizarRetencionRequest {
  facturaId: number;
  valorRetencion: number;
  usuarioId: number;
}

export interface FiltroFacturaRequest {
  numero?: string;
  numeroFactura?: string; // Mantener compatibilidad
  proveedorNombre?: string;
  areaNombre?: string;
  clienteId?: number;
  areaId?: number;
  sucursalId?: number;
  estado?: string;
  fechaEmisionDesde?: string | Date;
  fechaEmisionHasta?: string | Date;
  responsableId?: number;
  pagina: number;
  registrosPorPagina: number;
}

export interface FacturaDto {
  id: number;
  clienteId?: number;
  clienteNombre?: string;
  proveedorNombre?: string; // Del backend
  areaId?: number;
  areaNombre?: string;
  sucursalId?: number;
  sucursalNombre?: string;
  numeroFactura?: string;
  numero?: string; // Del backend
  fechaEmision: string;
  fechaVencimiento?: string;
  subtotal: number;
  iva: number;
  totalConIva?: number;
  totalPagar?: number; // Del backend
  valorRetencion?: number;
  totalFinal?: number;
  observaciones?: string;
  estado: string;
  tipoFactura?: string; // Del backend
  responsableId?: number;
  responsableNombre?: string;
  fechaCreacion?: string;
  usuarioCreacionId?: number;
  detalles?: FacturaDetalleDto[];
}

export interface ListarFacturasResponse {
  facturas: FacturaDto[];
  totalRegistros: number;
  pagina: number;
  registrosPorPagina: number;
  totalPaginas: number;
}

// ========== Servicio ==========

@Injectable({
  providedIn: 'root'
})
export class FacturasService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.backFacturasUrl}/Facturas`;

  /**
   * Crear una nueva factura
   */
  crearFactura(dto: FacturaCreateUpdateDto): Observable<{ mensaje: string; data: FacturaDto }> {
    return this.http.post<{ mensaje: string; data: FacturaDto }>(`${this.apiUrl}/crear-factura`, dto);
  }

  /**
   * Editar una factura existente
   */
  editarFactura(id: number, data: FacturaCreateUpdateDto): Observable<{ mensaje: string; data: FacturaDto }> {
    const request: UpdateRequest<FacturaCreateUpdateDto> = { id, data };
    return this.http.post<{ mensaje: string; data: FacturaDto }>(`${this.apiUrl}/editar-factura`, request);
  }

  /**
   * Eliminar una factura
   */
  eliminarFactura(id: number): Observable<{ mensaje: string }> {
    const request: IdRequest = { id };
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/eliminar-factura`, request);
  }

  /**
   * Cambiar el estado de una factura
   */
  cambiarEstadoFactura(request: CambioEstadoRequest): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/cambiar-estado-factura`, request);
  }

  /**
   * Asignar un responsable a la factura
   */
  asignarResponsable(facturaId: number, responsableId: number): Observable<{ mensaje: string }> {
    const request: AsignarResponsableRequest = { facturaId, responsableId };
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/asignar-responsable`, request);
  }

  /**
   * Actualizar la retención de una factura
   */
  actualizarRetencion(request: ActualizarRetencionRequest): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.apiUrl}/actualizar-retencion`, request);
  }

  /**
   * Listar facturas con paginación y filtros
   */
  listarFacturas(request: FiltroFacturaRequest): Observable<ListarFacturasResponse> {
    return this.http.post<ListarFacturasResponse>(`${this.apiUrl}/listar-facturas`, request);
  }

  /**
   * Obtener detalle de una factura por ID
   */
  obtenerFacturaDetalle(id: number): Observable<FacturaDto> {
    const request: IdRequest = { id };
    return this.http.post<FacturaDto>(`${this.apiUrl}/obtener-factura-detalle`, request);
  }
}
