import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { QuizService, Quiz } from './quiz.service';

@Component({
  selector: 'app-quiz-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="quiz-create">
      <h2>Tạo bài trắc nghiệm mới</h2>
      <form [formGroup]="quizForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="title">Tiêu đề:</label>
          <input type="text" id="title" formControlName="title" required>
        </div>
        <div class="form-group">
          <label for="duration">Thời gian (phút):</label>
          <input type="number" id="duration" formControlName="duration" required>
        </div>
        <div class="form-group">
          <label for="isOpen">Mở bài thi:</label>
          <input type="checkbox" id="isOpen" formControlName="isOpen">
        </div>
        <div formArrayName="questions">
          <h3>Câu hỏi</h3>
          <div *ngFor="let question of questions.controls; let i = index" [formGroupName]="i" class="question-card">
            <div class="question-header">
              <strong>Câu {{ i + 1 }} (1đ)</strong>
              <button type="button" (click)="removeQuestion(i)" class="btn btn-danger btn-sm float-right">Xóa</button>
            </div>
            <div class="question-content">
              <input type="text" formControlName="content" placeholder="Nội dung câu hỏi" required class="form-control">
            </div>
            <div class="answers-section">
              <h5>Đáp án:</h5>
              <div formArrayName="answers" class="answers-list">
                <div *ngFor="let answer of getAnswers(i).controls; let j = index" [formGroupName]="j" class="answer-item">
                  <input type="radio" [name]="'correct-' + i" [value]="j" (change)="setCorrectAnswer(i, j)" class="radio-input">
                  <input type="text" formControlName="content" placeholder="Đáp án" class="form-control answer-text">
                  <button type="button" (click)="removeAnswer(i, j)" class="btn btn-danger btn-sm">Xóa</button>
                </div>
              </div>
              <button type="button" (click)="addAnswer(i)" class="btn btn-secondary btn-sm">Thêm đáp án</button>
            </div>
          </div>
          <button type="button" (click)="addQuestion()" class="btn btn-primary">Thêm câu hỏi</button>
        </div>
        <button type="submit" [disabled]="quizForm.invalid">Tạo bài</button>
      </form>
    </div>
  `,
  styles: [`
    .quiz-create { padding: 20px; max-width: 800px; margin: 0 auto; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
    input[type="text"], input[type="number"] { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
    input[type="checkbox"] { margin-right: 5px; }
    .question-card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 20px; background: #f9f9f9; }
    .question-header { margin-bottom: 10px; color: #333; }
    .question-content { margin-bottom: 15px; }
    .answers-section h5 { margin-bottom: 10px; color: #555; }
    .answers-list { margin-bottom: 10px; }
    .answer-item { display: flex; align-items: center; margin-bottom: 8px; }
    .radio-input { margin-right: 10px; }
    .answer-text { flex: 1; margin-left: 10px; }
    .btn { padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
    .btn-primary { background: #007bff; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-danger { background: #dc3545; color: white; }
    .btn-sm { padding: 5px 10px; font-size: 0.875rem; }
    .float-right { float: right; }
  `]
})
export class QuizCreateComponent implements OnInit {
  quizForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private quizService: QuizService,
    private router: Router
  ) {
    this.quizForm = this.fb.group({
      title: ['', Validators.required],
      duration: [30, Validators.required],
      isOpen: [true], // default true
      questions: this.fb.array([])
    });
  }

  ngOnInit() {
    this.addQuestion(); // Add default question
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  addQuestion() {
    const question = this.fb.group({
      content: ['', Validators.required],
      answers: this.fb.array([
        this.fb.group({ content: '', isCorrect: false }),
        this.fb.group({ content: '', isCorrect: false })
      ])
    });
    this.questions.push(question);
  }

  removeQuestion(index: number) {
    this.questions.removeAt(index);
  }

  getAnswers(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('answers') as FormArray;
  }

  setCorrectAnswer(questionIndex: number, answerIndex: number) {
    const answers = this.getAnswers(questionIndex);
    answers.controls.forEach((control, index) => {
      control.get('isCorrect')?.setValue(index === answerIndex);
    });
  }

  addAnswer(questionIndex: number) {
    const answers = this.getAnswers(questionIndex);
    answers.push(this.fb.group({ content: '', isCorrect: false }));
  }

  removeAnswer(questionIndex: number, answerIndex: number) {
    const answers = this.getAnswers(questionIndex);
    answers.removeAt(answerIndex);
  }

  onSubmit() {
    if (this.quizForm.valid) {
      const formValue = this.quizForm.value;
      // Validate each question has at least one answer with content and one correct
      for (let q of formValue.questions) {
        const answers = q.answers.filter((a: any) => a.content.trim());
        if (answers.length === 0) {
          alert('Mỗi câu hỏi phải có ít nhất một đáp án.');
          return;
        }
        const hasCorrect = q.answers.some((a: any) => a.isCorrect);
        if (!hasCorrect) {
          alert('Mỗi câu hỏi phải có một đáp án đúng.');
          return;
        }
      }
      const questions: any[] = formValue.questions.map((q: any) => {
        const answers = q.answers;
        const correctIndex = answers.findIndex((a: any) => a.isCorrect);
        return {
          questionText: q.content,
          options: answers.map((a: any) => a.content),
          correctAnswerIndex: correctIndex,
          points: 1
        };
      });

      const quizData = {
        title: formValue.title,
        duration: formValue.duration,
        open: formValue.isOpen,
        questions: questions
      };

      this.quizService.createQuiz(quizData).subscribe({
        next: () => {
          this.router.navigate(['/quiz']);
        },
        error: (err) => {
          console.error('Error creating quiz', err);
        }
      });
    }
  }
}