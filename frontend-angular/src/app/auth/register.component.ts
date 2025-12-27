import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header bg-success text-white">
            <h4 class="mb-0">Đăng ký tài khoản QuizHub</h4>
          </div>
          <div class="card-body">
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
              <div class="mb-3">
                <label for="username" class="form-label">Tên đăng nhập</label>
                <input type="text" class="form-control" id="username" formControlName="username" required>
              </div>
              <div class="mb-3">
                <label for="fullName" class="form-label">Họ và tên</label>
                <input type="text" class="form-control" id="fullName" formControlName="fullName" required>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Mật khẩu</label>
                <input type="password" class="form-control" id="password" formControlName="password" required>
              </div>
              <div class="mb-3">
                <label for="role" class="form-label">Vai trò</label>
                <select class="form-select" id="role" formControlName="role" required>
                  <option value="STUDENT">Sinh viên</option>
                  <option value="TEACHER">Giảng viên</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>
              <button type="submit" class="btn btn-success w-100" [disabled]="registerForm.invalid">
                Đăng ký
              </button>
            </form>
            <div class="mt-3 text-center">
              <a routerLink="/auth/login">Đã có tài khoản? Đăng nhập</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      fullName: ['', Validators.required],
      password: ['', Validators.required],
      role: ['STUDENT', Validators.required]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('Register response:', response);
          alert('Đăng ký thành công! Vui lòng đăng nhập.');
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          console.log('Register error:', err);
          let errorMessage = 'Unknown error';
          if (typeof err.error === 'string') {
            errorMessage = err.error;
          } else if (err.error && typeof err.error === 'object') {
            errorMessage = 'Lỗi validation: ' + JSON.stringify(err.error);
          }
          alert('Đăng ký thất bại: ' + errorMessage);
        }
      });
    }
  }
}