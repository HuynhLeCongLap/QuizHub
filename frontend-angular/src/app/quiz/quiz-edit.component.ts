import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { QuizService, Quiz, Question } from './quiz.service';

@Component({
  selector: 'app-quiz-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="quiz-edit" *ngIf="quizForm">
      <h2>Chỉnh sửa bài trắc nghiệm</h2>
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
                  <input type="radio" [name]="'correct-' + i" [value]="j" (change)="setCorrectAnswer(i, j)" [checked]="answer.get('isCorrect')?.value" class="radio-input">
                  <input type="text" formControlName="content" placeholder="Đáp án" required class="form-control answer-text">
                  <button type="button" (click)="removeAnswer(i, j)" class="btn btn-danger btn-sm">Xóa</button>
                </div>
              </div>
              <button type="button" (click)="addAnswer(i)" class="btn btn-secondary btn-sm">Thêm đáp án</button>
            </div>
          </div>
          <button type="button" (click)="addQuestion()" class="btn btn-primary">Thêm câu hỏi</button>
        </div>
        <button type="submit" [disabled]="quizForm.invalid">Cập nhật bài</button>
      </form>
      <button (click)="backToList()">Quay lại</button>
    </div>
  `,
  styles: [`
    .quiz-edit { padding: 20px; max-width: 800px; margin: 0 auto; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
    .form-control { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
    .question-card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; margin-bottom: 20px; background: #f9f9f9; }
    .question-header { margin-bottom: 10px; color: #333; }
    .question-content { margin-bottom: 15px; }
    .answers-section h5 { margin-bottom: 10px; color: #555; }
    .answers-list { margin-bottom: 10px; }
    .answer-item { display: flex; align-items: center; margin-bottom: 8px; }
    .radio-input { margin-right: 10px; }
    .answer-text { flex: 1; margin-left: 10px; }
    .btn { padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; }
    .btn-primary { background: #007bff; color: white; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-danger { background: #dc3545; color: white; }
    .btn-sm { padding: 5px 10px; font-size: 0.875rem; }
    .float-right { float: right; }
  `]
})
export class QuizEditComponent implements OnInit {
  quiz: Quiz | null = null;
  quizForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private fb: FormBuilder
  ) {
    this.quizForm = this.fb.group({
      title: ['', Validators.required],
      duration: [30, Validators.required],
      isOpen: [false],
      questions: this.fb.array([])
    });
  }

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    console.log('Editing quiz id:', id);
    this.quizService.getQuiz(id).subscribe({
      next: (quiz) => {
        console.log('Loaded quiz:', quiz);
        console.log('Quiz questions:', quiz.questions);
        this.quiz = quiz;
        this.populateForm(quiz);
      },
      error: (err) => {
        console.error('Failed to load quiz:', err);
        alert('Không thể tải bài quiz để chỉnh sửa.');
      }
    });
  }

  populateForm(quiz: Quiz) {
    console.log('Populating form with quiz:', quiz);
    this.quizForm.patchValue({
      title: quiz.title,
      duration: quiz.duration,
      isOpen: quiz.open
    });

    const questionsArray = this.quizForm.get('questions') as FormArray;
    questionsArray.clear();

    if (quiz.questions) {
      console.log('Quiz has questions:', quiz.questions.length);
      quiz.questions.forEach(q => {
        console.log('Processing question:', q);
        const answers = q.options;
        console.log('Parsed answers:', answers);
        const questionGroup = this.fb.group({
          id: [q.id], // ⭐ Thêm ID của question
          content: [q.questionText, Validators.required],
          answers: this.fb.array(
            answers.map((ans: string, index: number) =>
              this.fb.group({
                content: [ans, Validators.required],
                isCorrect: [index === q.correctAnswerIndex]
              })
            )
          )
        });
        questionsArray.push(questionGroup);
      });
    } else {
      console.log('Quiz has no questions');
    }
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  addQuestion() {
    const question = this.fb.group({
      id: [null], // ⭐ Câu hỏi mới
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
    if (this.quizForm.valid && this.quiz) {
      const formValue = this.quizForm.value;
      const questions: Question[] = formValue.questions.map((q: any) => {
        const answers = q.answers;
        const correctIndex = answers.findIndex((a: any) => a.isCorrect);
        return {
          id: q.id ?? null, // ⭐⭐⭐ Gửi ID
          questionText: q.content,
          options: answers.map((a: any) => a.content), // string[]
          correctAnswerIndex: correctIndex,
          points: 1
        };
      });

      const updatedQuiz: Partial<Quiz> = {
        title: formValue.title,
        duration: formValue.duration,
        open: formValue.isOpen,
        questions: questions
      };

      this.quizService.updateQuiz(this.quiz.id, updatedQuiz).subscribe({
        next: () => {
          alert('Cập nhật thành công!');
          this.router.navigate(['/quiz']);
        },
        error: (err) => {
          console.error('Failed to update quiz:', err);
          alert('Không thể cập nhật bài quiz.');
        }
      });
    }
  }

  backToList() {
    this.router.navigate(['/quiz']);
  }
}