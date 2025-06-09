import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../assets/environment/environment';

export interface Usuario {
  id?: number;
  nombre: string;
  apellido: string;
  cedula: string;
  sucursalId: number; // Debe ser número
  identificacion: string;
  correo: string;
  contraseña: string;
  estadoCuenta: string;
  perfilId: number; // Debe ser número
  firmaHmac?: string;
}
interface CambiarContrasenaRequest {
  nuevaContrasena: string;
}
interface FiltroUsuario {
  nombre?: string;
  cedula?: string;
  correo?: string;
  estadoCuenta?: string;
  sucursalId?: number;
  perfilId?: number;
}

interface CatalogoUsuarioDTO {
  sucursales: { id: number; codigoSucursal: string; nombre: string }[];
  perfiles: { id: number; tipoPerfil: string }[];
}
export interface CajaChicaDTO {
  id: number;
  documentoNombre: string;
  fechaCreacion: string;
  estadoActual: string;
}
export interface CajaGeneralDTO {
  id: number;
  documentoNombre: string;
  rutaArchivo: string;
  fechaCreacion: Date;
  estado: string;
  ultimoEstado: string;
  fechaUltimoCambio: string;
  cargadorNombre: string;
  usuarioCambioNombre: string;
  sucursalNombre: string;
}
export interface CajaGeneralEstado {
  id: number;
  cajaGeneralId: number;
  usuarioCambioId: number;
  fechaCambio: string; // La fecha viene como string del backend
  nuevoEstado: string;
}
export interface CajaChicaEstado {
  id: number;
  cajaChicaId: number;
  usuarioCambioId: number;
  fechaCambio: string; // La fecha viene como string del backend
  nuevoEstado: string;
}

// Interfaz principal para un registro de Caja General
export interface CajaGeneral {
  id: number;
  nombreDocumento: string;
  rutaArchivo: string;
  sucursalId: number;
  fechaCreacion: string; // La fecha viene como string del backend
  cargadorId: number;
  ingresadoPor: number | null; // Puede ser null
  comentario: string;
  comentarioCargador: string;
  numeroComprobante: string;
  estado: string;
  estados: CajaGeneralEstado[]; // ¡Esta es la propiedad que faltaba!
}
export interface CajaGeneralFilterParams extends PaginationParams {
  sortField?: string; // Es mejor práctica usar 'string' en lugar de 'any'
  sortOrder?: number; // 1 para ascendente, -1 para descendente
  nombreDocumento?: string;
  sucursalId?: number;
  fechaCreacionDesde?: Date;
  fechaCreacionHasta?: Date;
  cargadorId?: number;
  ingresadoPor?: number;
  numeroComprobante?: string;
  estado?: string;
  usuarioCambioEstadoId?: number;
  fechaCambioEstadoDesde?: Date;
  fechaCambioEstadoHasta?: Date;
}

export interface PagedCajaGeneralResponse {
  data: CajaGeneralDTO[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
// src/app/models/caja-chica.model.ts
export interface CajaChica {
  id: number;
  documentoNombre: string;
  rutaArchivo: string;
  sucursalId: number;
  fechaCreacion: Date;
  ingresadoPor: number;
  cargadorId: number;
  numeroComprobante: string;
  comentarioCargador?: string;
  estado: string;
  comentario?: string;
  estados: CajaChicaEstado[];
}
export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
}
export interface PagedResult<T> {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  items: T[];
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuario/crear`;
  private FiltroC = `${environment.apiUrl}/usuario`;
  private apiUrlObtener = `${environment.apiUrl}/usuario/obtener-usuarios`;
  private apiUrlActualizarEstado = `${environment.apiUrl}/usuario/actualizar-estado`;
  private apiUrlIniciarSesion = `${environment.apiUrl}/usuario/iniciar-sesion`;
  private apiUrlCambiarContrasena = `${environment.apiUrl}/usuario/cambiar-contrasena`;



  constructor(private http: HttpClient) {}

  crearUsuario(usuario: Usuario): Observable<Usuario> {
    // Convertir valores a número antes de enviarlos
    const usuarioAEnviar = {
      ...usuario,
      perfilId: Number(usuario.perfilId),
      sucursalId: Number(usuario.sucursalId)
    };

    return this.http.post<Usuario>(this.apiUrl, usuarioAEnviar);
  }
  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrlObtener);
  }
  actualizarEstadoCuenta(usuarioId: number, nuevoEstado: string): Observable<any> {
    const url = `${this.apiUrlActualizarEstado}/${usuarioId}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' }); // Configura el encabezado
    return this.http.post(url, nuevoEstado, { headers: headers }); // Envía el encabezado
}
iniciarSesion(correo: string, contraseña: string): Observable<Usuario> {
  return this.http.post<Usuario>(this.apiUrlIniciarSesion, { correo, contraseña });
}
cambiarContrasena(usuarioId: number, nuevaContrasena: string): Observable<any> {
  const url = `${this.apiUrlCambiarContrasena}/${usuarioId}`;
  const body: CambiarContrasenaRequest = { nuevaContrasena };
  return this.http.post(url, body);
}
filtrarUsuarios(filtro: FiltroUsuario): Observable<Usuario[]> {
  const url = `${environment.apiUrl}/usuario/filtrar`;
  return this.http.post<Usuario[]>(url, filtro);
}

obtenerCatalogosUsuario(): Observable<CatalogoUsuarioDTO> {
  const url = `${environment.apiUrl}/usuario/catalogos`;
  return this.http.get<CatalogoUsuarioDTO>(url);
}




getCajaChicasFilteredAndPaginated(filterParams: PaginationParams): Observable<PagedResult<CajaChica>> {
    // Para una petición POST, los parámetros se envían en el cuerpo
    // La URL debe ser la del endpoint POST, por ejemplo: /api/CajaChica/filtered-paginated
    return this.http.post<PagedResult<CajaChica>>(`${this.FiltroC}/filtered-paginated`, filterParams);
  }
  obtenerTodasLasSucursales(): Observable<{ id: number; codigoSucursal: string; nombre: string }[]> {
    const url = `${environment.apiUrl}/usuario/sucursales`;
    return this.http.get<{ id: number; codigoSucursal: string; nombre: string }[]>(url);
  }
  obtenerUsuariosG(): Observable<Usuario[]> {
    const url = `${environment.apiUrl}/usuario/usuariosTodos`;
    return this.http.get<Usuario[]>(url);
  }
  getCajaGeneralFilteredAndPaginated(params: CajaGeneralFilterParams): Observable<PagedResult<CajaGeneral>> {
    const paramsToSend: any = { ...params }; // Crear una copia para no modificar el original
    if (paramsToSend.fechaCreacionDesde) {
      paramsToSend.fechaCreacionDesde = paramsToSend.fechaCreacionDesde.toISOString();
    }
    if (paramsToSend.fechaCreacionHasta) {
      paramsToSend.fechaCreacionHasta = paramsToSend.fechaCreacionHasta.toISOString();
    }
    if (paramsToSend.sucursalId === 0) paramsToSend.sucursalId = undefined;
    if (paramsToSend.cargadorId === 0) paramsToSend.cargadorId = undefined;
    if (paramsToSend.ingresadoPor === 0) paramsToSend.ingresadoPor = undefined;
    if (paramsToSend.estado === '') paramsToSend.estado = undefined;

    return this.http.post<PagedResult<CajaGeneral>>(`${this.FiltroC}/filtered-paginatedCajaGeneral`, paramsToSend);
  }
}
