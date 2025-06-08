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
export interface PagedCajaGeneralResponse {
  data: CajaGeneralDTO[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuario/crear`;
  private Filtro = `${environment.apiUrl}`;
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
obtenerCajaChicaConEstado(params: {
  sucursalId?: number;
  estado?: string;
  desde?: Date;
  hasta?: Date;
  page?: number;
  pageSize?: number;
}): Observable<{ data: CajaChicaDTO[]; total: number }> {
  let queryParams: string[] = [];

  if (params.sucursalId != null) queryParams.push(`sucursalId=${params.sucursalId}`);
  if (params.estado) queryParams.push(`estado=${encodeURIComponent(params.estado)}`);
  if (params.desde) queryParams.push(`desde=${params.desde.toISOString()}`);
  if (params.hasta) queryParams.push(`hasta=${params.hasta.toISOString()}`);
  queryParams.push(`pageNumber=${params.page ?? 1}`);
  queryParams.push(`pageSize=${params.pageSize ?? 10}`);

  const url = `${environment.apiUrl}/usuario/caja-chica/filtrada?${queryParams.join('&')}`;
  return this.http.get<{ data: CajaChicaDTO[]; total: number }>(url);
}
obtenerCajaGeneralConEstado(params: {
  sucursalId?: number;
  estado?: string;
  desde?: Date;
  hasta?: Date;
  page?: number;
  pageSize?: number;
}): Observable<PagedCajaGeneralResponse> { // <--- Changed this line
  let queryParams: string[] = [];

  if (params.sucursalId != null) queryParams.push(`sucursalId=${params.sucursalId}`);
  if (params.estado) queryParams.push(`estado=${encodeURIComponent(params.estado)}`);
  if (params.desde) queryParams.push(`desde=${params.desde.toISOString()}`);
  if (params.hasta) queryParams.push(`hasta=${params.hasta.toISOString()}`);
  queryParams.push(`pageNumber=${params.page ?? 1}`);
  queryParams.push(`pageSize=${params.pageSize ?? 10}`);

  const url = `${environment.apiUrl}/usuario/caja-general/estados?${queryParams.join('&')}`;
  return this.http.get<PagedCajaGeneralResponse>(url); // <--- Changed this line
}



}
