import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../assets/environment/environment";

export interface Sucursal {
  id: number;
  codigoSucursal: string;
  nombre: string;
}

export interface EstadoCajaGeneral {
  id: number;
  cajaGeneralId: number;
  usuarioCambioId: number;
  fechaCambio: Date;
  nuevoEstado: string;
  comentario?: string;
}
export interface EstadoCajaGeneral2 {
  id: number;
  cajaGeneralId: number;
  usuarioCambioId: number;
  usuario:string;
  fechaCambio: string;
  nuevoEstado: string;
  cajaGeneral_Id: number;
  cajaGeneral_NombreDocumento: string;
  cajaGeneral_RutaArchivo: string;
  cajaGeneral_SucursalId: number;
  cajaGeneral_FechaCreacion: string;
  cajaGeneral_CargadorId: number;
  cajaGeneral_IngresadoPor: number | null;
  cajaGeneral_Comentario: string;
  cajaGeneral_ComentarioCargador: string | null;
  cajaGeneral_NumeroComprobante: string;
  cajaGeneral_Estado: string;
}

export interface CajaGeneral {
  id: number;
  nombreDocumento: string;
  rutaArchivo: string;
  sucursalId: number;
  fechaCreacion: string;
  ingresadoPor: number;
  cargadorId: number;
  numeroComprobante: string;
  estado: string;
  comentario?: string;
  procesadorId?: number;
  comentarioCargador?: string;
}

export interface CajaGeneralConEstados {
  cajaGeneral: CajaGeneral;
  estadosCajaGeneral: EstadoCajaGeneral[];
  nombreCargador: string;
}
export interface PagedResponse {
  estados: EstadoCajaGeneral2[] ; // Modifica esta línea
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
export interface EstadoCajaGeneralAccionDto {
  cajaGeneralId: number;
  procesadorId: number;
  comentario?: string;
}
export interface FechaConEstados {
  fecha: Date;
  estados: string[];
}

export interface EstadoCajaGeneralFilter {
  id?: number;
  cajaGeneralId?: number;
  usuarioCambioId?: number;
  fechaCambio?: Date;
  nuevoEstado?: string;
  nombreDocumento?: string;
  numeroComprobante?: string;
  estadoCaja?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CajaGeneralPRCService {
  private apiUrl = `${environment.apiUrl}/EstadoCajaGeneral`;

  constructor(private http: HttpClient) { }

  obtenerSucursalesPorPerfilId(perfilId: number): Observable<Sucursal[]> {
    return this.http.get<Sucursal[]>(`${this.apiUrl}/sucursales/${perfilId}`);
  }

  obtenerRegistrosPorSucursalYFechas(
  sucursalId: number,
  fechaInicio: Date | null,
  fechaFin: Date | null,
  estado?: string | null // 1. Añade el parámetro opcional 'estado'
): Observable<CajaGeneralConEstados[]> {
  let params = new HttpParams().set('sucursalId', sucursalId.toString());
  if (fechaInicio) {
    params = params.set('fechaInicio', fechaInicio.toISOString());
  }
  if (fechaFin) {
    params = params.set('fechaFin', fechaFin.toISOString());
  }
  if (estado) {
    params = params.set('estado', estado);
  }
  return this.http.get<CajaGeneralConEstados[]>(`${this.apiUrl}/registros`, { params });
}

  aceptarCajaGeneral(cajaGeneralId: number, procesadorId: number, comentario: string): Observable<any> {
    const body = { cajaGeneralId, procesadorId, comentario };
    return this.http.put(`${this.apiUrl}/aceptar`, body);
  }

  rechazarCajaGeneral(cajaGeneralId: number, procesadorId: number, comentario: string): Observable<any> {
    const body = { cajaGeneralId, procesadorId, comentario };
    return this.http.put(`${this.apiUrl}/rechazar`, body);
  }

  obtenerFechasConEstados(sucursalId: number, anio: number): Observable<FechaConEstados[]> {
    const url = `${this.apiUrl}/fechas-registros?sucursalId=${sucursalId}&anio=${anio}`;
    return this.http.get<FechaConEstados[]>(url);
  }
  descargarArchivo(rutaArchivo: string): Observable<Blob> {
    const params = { rutaArchivo: rutaArchivo };
    return this.http.get(`${this.apiUrl}/descargar-archivo`, {
      params,
      responseType: 'blob' // Para descargar el archivo como Blob
    });
  }
  obtenerRegistrosFiltrados(
    filtros: any,
    paginacion: { pagina: number; tamanioPagina: number }
  ): Observable<{ datos: CajaGeneralConEstados[]; totalRegistros: number }> {
    const body = {
      filtros,
      paginacion
    };

    return this.http.post<{ datos: CajaGeneralConEstados[]; totalRegistros: number }>(
      `${this.apiUrl}/filtrar-registros`,
      body
    );
  }
  getEstadosCajaGeneralPaginadoPost(
    pageNumber: number,
    pageSize: number,
    filter: EstadoCajaGeneralFilter
  ): Observable<PagedResponse> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.post<PagedResponse>(`${this.apiUrl}/paginado`, filter, { params });
  }

}
