import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuizService, Quiz } from './quiz.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1 class="mb-4">Danh sách bài trắc nghiệm</h1>
      <button class="btn btn-primary mb-3" *ngIf="isTeacher()" (click)="createQuiz()">
        <i class="fas fa-plus"></i> Tạo bài mới
      </button>
      <div class="row">
        <div *ngFor="let quiz of quizzes" class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">{{ quiz.title }}</h5>
              <p class="card-text">Thời gian: {{ quiz.duration }} phút</p>
              <p class="card-text">
                <span class="badge" [class]="quiz.open ? 'bg-success' : 'bg-secondary'">
                  {{ quiz.open ? 'Mở' : 'Đóng' }}
                </span>
              </p>
            </div>
            <div class="card-footer">
              <button class="btn btn-outline-primary me-2" *ngIf="isTeacher()" (click)="editQuiz(quiz.id)">
                <i class="fas fa-edit"></i> Chỉnh sửa
              </button>
              <button class="btn btn-outline-danger me-2" *ngIf="isAdmin()" (click)="deleteQuiz(quiz.id)">
                <i class="fas fa-trash"></i> Xóa
              </button>
              <button class="btn btn-success" *ngIf="isStudent() && quiz.open" (click)="takeQuiz(quiz.id)">
                <i class="fas fa-play"></i> Làm bài
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class QuizListComponent implements OnInit {
  quizzes: Quiz[] = [];

  constructor(
    private quizService: QuizService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadQuizzes();
  }

  loadQuizzes() {
    console.log('Loading quizzes...');
    this.quizService.getQuizzes().subscribe({
      next: quizzes => {
        console.log('Quizzes received:', quizzes);
        this.quizzes = quizzes;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading quizzes:', err);
      }
    });
  }

  isTeacher(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'TEACHER' || user?.role === 'ADMIN';
  }

  isStudent(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'STUDENT';
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  createQuiz() {
    this.router.navigate(['/quiz/create']);
  }

  editQuiz(id: number) {
    this.router.navigate(['/quiz/edit', id]);
  }

  takeQuiz(id: number) {
    this.router.navigate(['/quiz/take', id]);
  }

  deleteQuiz(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa bài quiz này?')) {
      this.quizService.deleteQuiz(id).subscribe({
        next: () => {
          this.loadQuizzes();
        },
        error: (error) => {
          console.error('Error deleting quiz:', error);
          alert('Có lỗi xảy ra khi xóa bài quiz');
        }
      });
    }
  }
}