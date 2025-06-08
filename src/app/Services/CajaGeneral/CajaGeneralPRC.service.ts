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
}

export interface CajaGeneralConEstados {
  cajaGeneral: CajaGeneral;
  estadosCajaGeneral: EstadoCajaGeneral[];
  nombreCargador: string;
}

export interface EstadoCajaGeneralAccionDto {
  cajaGeneralId: number;
  procesadorId: number;
  comentario?: string;
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
    fechaFin: Date | null
  ): Observable<CajaGeneralConEstados[]> {
    let params = new HttpParams().set('sucursalId', sucursalId.toString());

    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio.toISOString());
    }

    if (fechaFin) {
      params = params.set('fechaFin', fechaFin.toISOString());
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

  obtenerFechasRegistrosPorSucursal(sucursalId: number): Observable<Date[]> {
    return this.http.get<Date[]>(`${this.apiUrl}/fechas-registros?sucursalId=${sucursalId}`);
  }
  descargarArchivo(rutaArchivo: string): Observable<Blob> {
    const params = { rutaArchivo: rutaArchivo };
    return this.http.get(`${this.apiUrl}/descargar-archivo`, {
      params,
      responseType: 'blob' // Para descargar el archivo como Blob
    });
  }
}
