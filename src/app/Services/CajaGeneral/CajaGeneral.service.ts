
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../assets/environment/environment';

export interface CajaGeneral {
  id: number;
  nombreDocumento: string;
  rutaArchivo: string;
  sucursalId: number;
  fechaCreacion: string;
  cargadorId: number;
  ingresadoPor: number|null;
  comentario: string;
  numeroComprobante: string;
  estado: string;
  comentarioCargador?: string;
}
@Injectable({
  providedIn: 'root'
})
export class CajaGeneralService {
  private apiUrl = `${environment.apiUrl}/cajageneral`;

  constructor(private http: HttpClient) { }

  crearCajaGeneral(cajaGeneral: CajaGeneral): Observable<CajaGeneral> {
    const usuarioId = this.getUsuarioId();
    const sucursalId = this.getSucursalId();

    if (!usuarioId) {
      return throwError(() => new Error('Usuario ID no encontrado en sessionStorage.'));
    }

    const cajaGeneralAEnviar: CajaGeneral = {
      ...cajaGeneral,
      cargadorId: Number(usuarioId),
      sucursalId: Number(sucursalId),
      ingresadoPor: null,
      estado: 'Pendiente'
    };

    return this.http.post<CajaGeneral>(`${this.apiUrl}/crear`, cajaGeneralAEnviar);
  }

  obtenerCajaGeneralPorSucursalIdPendienteSinRuta(): Observable<CajaGeneral[]> {
    const sucursalId = this.getSucursalId();

    if (sucursalId) {
      return this.http.get<CajaGeneral[]>(`${this.apiUrl}/pendientesS/${sucursalId}`);
    } else {
      return throwError(() => new Error('Sucursal ID no encontrado en sessionStorage.'));
    }
  }

  obtenerCajaGeneralConRutaArchivo(): Observable<CajaGeneral[]> {
    const sucursalId = this.getSucursalId();

    if (sucursalId) {
      return this.http.get<CajaGeneral[]>(`${this.apiUrl}/obtener/${sucursalId}`);
    } else {
      return throwError(() => new Error('Sucursal ID no encontrado en sessionStorage.'));
    }
  }

  cargarArchivoCajaGeneral(cajaGeneralId: number, sucursalId: number, formData: FormData): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/cargar-archivo/${cajaGeneralId}/${sucursalId}`, formData);
  }

  private getUsuarioId(): string | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem('usuarioId');
    }
    return null;
  }

  private getSucursalId(): string | null {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem('sucursal');
    }
    return null;
  }
  obtenerCajaGeneralFiltrado(filtro: any) {
  return this.http.post<any>(`${this.apiUrl}/filtrar`, filtro);
}

}
