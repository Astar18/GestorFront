import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const firmaHmac = sessionStorage.getItem('firmaHmac');

    if (!firmaHmac) {
      this.router.navigate(['/login']); // Redirige al login si no hay firmaHmac
      return false;
    }

    return true;
  }
}
