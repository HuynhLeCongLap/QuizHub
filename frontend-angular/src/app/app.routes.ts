import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { QuestionListComponent } from './question/question-list.component';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      { path: 'login', loadComponent: () => import('./auth/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./auth/register.component').then(m => m.RegisterComponent) }
    ]
  },
  {
    path: 'quiz',
    canActivate: [AuthGuard],
    children: [
      { path: '', loadComponent: () => import('./quiz/quiz-list.component').then(m => m.QuizListComponent) },
      { path: 'create', loadComponent: () => import('./quiz/quiz-create.component').then(m => m.QuizCreateComponent) },
      { path: 'edit/:id', loadComponent: () => import('./quiz/quiz-edit.component').then(m => m.QuizEditComponent) },
      { path: 'take/:id', loadComponent: () => import('./quiz/quiz-take.component').then(m => m.QuizTakeComponent) }
    ]
  },
  {
    path: 'question',
    loadComponent: () => import('./question/question-list.component').then(m => m.QuestionListComponent)
  },
  {
    path: 'result',
    canActivate: [AuthGuard],
    loadComponent: () => import('./result/result-list.component').then(m => m.ResultListComponent)
  },
  { path: '', redirectTo: '/quiz', pathMatch: 'full' },
  { path: '**', redirectTo: '/quiz' }
];
