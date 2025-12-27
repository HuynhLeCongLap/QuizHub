import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizService, Result } from '../quiz/quiz.service';

@Component({
  selector: 'app-result-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1 class="mb-4">Kết quả bài thi</h1>
      <div class="card">
        <div class="card-body">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Họ và tên</th>
                <th>Bài thi</th>
                <th>Điểm</th>
                <th>Thời gian hoàn thành</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let result of results">
                <td>{{ result.full_name }}</td>
                <td>{{ result.quizTitle }}</td> 
                <td>{{ result.score }}</td>
                <td>{{ result.completedAt | date:'short' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ResultListComponent implements OnInit {
  results: Result[] = [];

  constructor(private quizService: QuizService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadResults();
  }

  loadResults() {
    console.log('Loading results...');
    this.quizService.getResults().subscribe({
      next: results => {
        console.log('Results loaded:', results);
        this.results = results;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading results:', err);
      }
    });
  }
}