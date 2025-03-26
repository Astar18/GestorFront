import { FormBuilder, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';  // Asegúrate de importar también ButtonModule si usas pButton

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CardModule, PasswordModule, CheckboxModule, ReactiveFormsModule, InputTextModule, ButtonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: [''],
      password: [''],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log(this.loginForm.value);
    }
  }
}
