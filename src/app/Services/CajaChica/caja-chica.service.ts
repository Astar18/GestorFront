import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs'; // Importa 'of' y 'throwError'
import { environment } from '../../../assets/environment/environment';

export interface CajaChica {
  id: number;
  documentoNombre: string;
  sucursalId: number;
  fechaCreacion: string;
  cargadorId: number;
  ingresadoPor?: number;
  numeroComprobante: string;
  estado: string;
  comentarioCargador?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CajaChicaService {
  private apiUrl = `${environment.apiUrl}/cajachica`;

  constructor(private http: HttpClient) { }

  crearCajaChica(cajaChica: CajaChica): Observable<CajaChica> {
    const usuarioId = this.getUsuarioId();
    const sucursalId = this.getSucursalId();

    if (!usuarioId) {
      return throwError(() => new Error('Usuario ID no encontrado en sessionStorage.'));
    }

    const cajaChicaAEnviar: CajaChica = {
      ...cajaChica,
      cargadorId: Number(usuarioId),
      sucursalId: Number(sucursalId),
      ingresadoPor: undefined,
      estado: 'Pendiente'
    };

    return this.http.post<CajaChica>(`${this.apiUrl}/crear`, cajaChicaAEnviar);
  }

  obtenerCajaChicaPorSucursalIdPendienteSinRuta(): Observable<CajaChica[]> {
    const sucursalId = this.getSucursalId();

    if (sucursalId) {
      return this.http.get<CajaChica[]>(`${this.apiUrl}/pendientesS/${sucursalId}`);
    } else {
      return throwError(() => new Error('Sucursal ID no encontrado en sessionStorage.'));
    }
  }

  obtenerCajaChicaConRutaArchivo(): Observable<CajaChica[]> {
    const sucursalId = this.getSucursalId();

    if (sucursalId) {
      return this.http.get<CajaChica[]>(`${this.apiUrl}/obtener/${sucursalId}`);
    } else {
      return throwError(() => new Error('Sucursal ID no encontrado en sessionStorage.'));
    }
  }

  cargarArchivoCajaChica(cajaChicaId: number, sucursalId: number, formData: FormData): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/cargar-archivo/${cajaChicaId}/${sucursalId}`, formData);
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



}

