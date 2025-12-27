import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Question {
  id: number;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  quizId: number;
  points: number;
}

export interface Quiz {
  id: number;
  title: string;
  duration: number; // in minutes
  createdBy: number;
  open: boolean;
  questions?: Question[];
}

export interface Result {
  id: number;
  score: number;
  userId: number;
  full_name: string;
  quizId: number;
  quizTitle: string;
  completedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'http://localhost:8080/api/quizzes'; // Adjust backend URL

  constructor(private http: HttpClient) {}

  getQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(this.apiUrl);
  }

  getQuiz(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.apiUrl}/${id}`);
  }

  createQuiz(quiz: Partial<Quiz>): Observable<Quiz> {
    return this.http.post<Quiz>(this.apiUrl, quiz);
  }

  updateQuiz(id: number, quiz: Partial<Quiz>): Observable<Quiz> {
    return this.http.put<Quiz>(`${this.apiUrl}/${id}`, quiz);
  }
  addQuestionToQuiz(quizId: number, questionId: number): Observable<Quiz> {
    return this.http.post<Quiz>(`${this.apiUrl}/${quizId}/questions/${questionId}`, {});
  }
  deleteQuiz(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  submitResult(result: Partial<Result>): Observable<Result> {
    return this.http.post<Result>(`${this.apiUrl}/../results`, result);
  }

  getResults(): Observable<Result[]> {
    return this.http.get<Result[]>(`${this.apiUrl}/../results`);
  }
}