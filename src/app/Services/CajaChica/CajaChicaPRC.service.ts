import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../assets/environment/environment';
export interface Sucursal {
    id: number;
    codigoSucursal: string;
    nombre: string;
}
export interface CajaChica {
    id: number;
    documentoNombre: string;
    sucursalId: number;
    fechaCreacion: string;
    cargadorId: number;
    ingresadoPor?: number;
    rutaArchivo: string;
    numeroComprobante: string;
    estado: string;
    comentario: string;
    comentarioCargador?: string;
}
export interface CajaChicaConEstados {
  cajaChica: CajaChica;
  nombreCargador: string;
}

@Injectable({
    providedIn: 'root'
})
export class CajaChicaPRCService {
    private apiUrl = `${environment.apiUrl}`;

    constructor(private http: HttpClient) { }

    obtenerSucursalesPorPerfil(perfilId: number): Observable<Sucursal[]> {
        return this.http.get<Sucursal[]>(`${this.apiUrl}/EstadoCajaChica/sucursalesPorPerfil/${perfilId}`);
    }
    obtenerRegistrosPorSucursalYFechas(sucursalId: number, fechaInicio: Date, fechaFin: Date): Observable<CajaChicaConEstados[]> {
      let params = new HttpParams()
          .set('sucursalId', sucursalId.toString())
          .set('fechaInicio', fechaInicio.toISOString())
          .set('fechaFin', fechaFin.toISOString());

      return this.http.get<CajaChicaConEstados[]>(`${this.apiUrl}/EstadoCajaChica/registrosPorSucursalYFechas`, { params: params });
  }
  obtenerFechasPorSucursal(sucursalId: number): Observable<Date[]> {
    return this.http.get<Date[]>(`${this.apiUrl}/CajaChica/fechas-registros?sucursalId=${sucursalId}`);
  }
  descargarArchivo(rutaArchivo: string): Observable<Blob> {
    const params = { rutaArchivo: rutaArchivo };
    return this.http.get(`${this.apiUrl}/EstadoCajaChica/descargar-archivo`, {
      params,
      responseType: 'blob' // Para descargar el archivo como Blob
    });
  }
  // Método para rechazar un registro de CajaChica
  rechazarCajaChica(cajaChicaId: number, procesadorId: number, comentario: string): Observable<any> {
    const body = { cajaChicaId, procesadorId, comentario };
    return this.http.post(`${this.apiUrl}/EstadoCajaChica/rechazar`, body);
  }

  // Método para aceptar un registro de CajaChica
  aceptarCajaChica(cajaChicaId: number, procesadorId: number, comentario: string): Observable<any> {
    const body = { cajaChicaId, procesadorId, comentario };
    return this.http.post(`${this.apiUrl}/EstadoCajaChica/aceptar`, body);
  }
}
