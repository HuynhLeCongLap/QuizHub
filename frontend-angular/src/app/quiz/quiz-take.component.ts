import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { QuizService, Quiz, Result } from './quiz.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-quiz-take',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="quiz-take" *ngIf="quiz">
      <h2>{{ quiz.title }}</h2>
      <div class="timer">Thời gian còn lại: {{ timeLeft }} phút</div>
      <form [formGroup]="quizForm" (ngSubmit)="submitQuiz()">
        <div *ngFor="let question of quiz.questions || []; let i = index">
          <div class="question">
            <h4>{{ i + 1 }}. {{ question.questionText }} ({{ question.points }} điểm)</h4>
            <div *ngFor="let option of question.options; let j = index">
              <label>
                <input type="radio" [name]="'question' + i" [value]="j" [formControl]="getAnswerControl(i)">
                {{ option }}
              </label>
            </div>
          </div>
        </div>
        <button type="submit">Nộp bài</button>
      </form>
    </div>
  `,
  styles: [`
    .quiz-take { padding: 20px; }
    .timer { font-size: 18px; color: red; margin-bottom: 20px; }
    .question { margin-bottom: 20px; }
    label { display: block; margin: 5px 0; }
    button { padding: 10px 20px; cursor: pointer; }
  `]
})
export class QuizTakeComponent implements OnInit, OnDestroy {
  quiz: Quiz | null = null;
  quizForm: FormGroup;
  timeLeft: number = 0;
  private timerSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.quizForm = this.fb.group({
      answers: this.fb.array([])
    });
  }

  ngOnInit() {
    console.log('QuizTakeComponent ngOnInit called');
    const id = +this.route.snapshot.paramMap.get('id')!;
    console.log('Quiz ID:', id);
    this.quizService.getQuiz(id).subscribe({
      next: (quiz) => {
        console.log('Quiz loaded:', quiz);
        this.quiz = quiz;
        this.timeLeft = quiz.duration;
        this.startTimer();
        // Initialize form controls for answers
        if (quiz.questions) {
          quiz.questions.forEach(() => {
            (this.quizForm.get('answers') as FormArray).push(this.fb.control(''));
          });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load quiz:', err);
        alert('Không thể tải bài quiz. Vui lòng kiểm tra đăng nhập và thử lại.');
      }
    });
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  startTimer() {
    this.timerSubscription = interval(60000).subscribe(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.submitQuiz();
      }
    });
  }

  getAnswerControl(index: number) {
    return (this.quizForm.get('answers') as FormArray).at(index) as FormControl;
  }

  submitQuiz() {
    if (!this.quiz) return;
    const answers = this.quizForm.value.answers;
    let totalScore = 0;
    if (this.quiz.questions) {
      this.quiz.questions.forEach((question, index) => {
        const selectedAnswer = answers[index];
        if (selectedAnswer !== '' && parseInt(selectedAnswer) === question.correctAnswerIndex) {
          totalScore += question.points || 1;
        }
      });
    }
    console.log('Score:', totalScore);

    const result: Partial<Result> = {
      score: totalScore,
      quizId: this.quiz.id
    };

    this.quizService.submitResult(result).subscribe({
      next: () => {
        alert(`Bài thi hoàn thành! Điểm của bạn: ${totalScore}`);
        this.router.navigate(['/quiz']);
      },
      error: (err) => {
        console.error('Failed to submit result:', err);
        alert('Không thể lưu kết quả. Vui lòng thử lại.');
      }
    });
  }
}