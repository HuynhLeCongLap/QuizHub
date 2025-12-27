import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuestionService, Question } from './question.service';
import { QuizService, Quiz } from '../quiz/quiz.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-list.component.html',
  styles: []
})
export class QuestionListComponent implements OnInit {
  questions: Question[] = [];
  quizzes: Quiz[] = [];
  showCreateForm = false;
  isCreating = false;
  isEditing = false;
  editingQuestion: Question | null = null;
  newQuestion: Question = {
    questionText: '',
    options: ['', ''],
    correctAnswerIndex: 0,
    points: 1
  };

  constructor(private questionService: QuestionService, private quizService: QuizService, public authService: AuthService) {
    console.log('QuestionListComponent constructor called');
  }

  ngOnInit() {
    console.log('QuestionListComponent ngOnInit called');
    this.loadQuestions();
    this.loadQuizzes();
  }

  loadQuestions() {
    console.log('Loading questions...');
    this.questionService.getAllQuestions().subscribe({
      next: (data) => {
        console.log('Questions loaded:', data);
        this.questions = data;
      },
      error: (err) => {
        console.error('Error loading questions:', err);
        // Có thể thêm thông báo lỗi cho user
      }
    });
  }

  loadQuizzes() {
    this.quizService.getQuizzes().subscribe({
      next: (data: Quiz[]) => {
        this.quizzes = data;
      },
      error: (err: any) => console.error('Error loading quizzes:', err)
    });
  }

  addToQuiz(questionId: number | undefined, event: Event) {
    if (!questionId) return;
    const target = event.target as HTMLSelectElement;
    const quizId = target.value;
    if (!quizId) return; // If empty option selected
    const quizIdNum = parseInt(quizId, 10);
    this.quizService.addQuestionToQuiz(quizIdNum, questionId).subscribe({
      next: () => {
        alert('Đã thêm câu hỏi vào bài trắc nghiệm!');
        this.loadQuestions(); // Reload to update
      },
      error: (err: any) => {
        console.error('Error adding question to quiz:', err);
        alert('Lỗi khi thêm câu hỏi vào bài trắc nghiệm.');
      }
    });
  }

  createQuestion() {
    if (this.isCreating) return; // Prevent double submit
    // Validate options are not empty
    if (this.newQuestion.options.some(opt => !opt.trim())) {
      alert('Tất cả lựa chọn phải được điền.');
      return;
    }
    this.isCreating = true;
    this.questionService.createQuestion(this.newQuestion).subscribe({
      next: () => {
        this.loadQuestions();
        window.location.reload(); // Reload page to show new question
        this.showCreateForm = false;
        this.editingQuestion = null;
        this.resetForm();
        this.isCreating = false;
      },
      error: (err) => {
        console.error('Error creating question:', err);
        this.isCreating = false;
      }
    });
  }

  editQuestion(question: Question) {
    this.editingQuestion = { ...question }; // Clone để không ảnh hưởng đến original
    this.showCreateForm = false; // Đóng form tạo nếu đang mở
  }

  cancelEdit() {
    this.editingQuestion = null;
    this.isEditing = false;
  }

  saveEdit() {
    if (this.isEditing || !this.editingQuestion || !this.editingQuestion.id) return;
    // Validate options are not empty
    if (this.editingQuestion.options.some(opt => !opt.trim())) {
      alert('Tất cả lựa chọn phải được điền.');
      return;
    }
    this.isEditing = true;
    this.questionService.updateQuestion(this.editingQuestion.id, this.editingQuestion).subscribe({
      next: () => {
        this.loadQuestions();
        window.location.reload(); // Reload page to show updated question
        this.editingQuestion = null;
        this.isEditing = false;
      },
      error: (err) => {
        console.error('Error updating question:', err);
        this.isEditing = false;
      }
    });
  }

  deleteQuestion(id: number) {
    if (confirm('Bạn có chắc muốn xóa câu hỏi này? Hành động này không thể hoàn tác.')) {
      this.questionService.deleteQuestion(id).subscribe({
        next: () => {
          this.loadQuestions();
          window.location.reload();
        },
        error: (err) => console.error('Error deleting question:', err)
      });
    }
  }

  addOption() {
    this.newQuestion.options.push('');
  }

  removeOption(index: number) {
    if (this.newQuestion.options.length > 2) {
      this.newQuestion.options.splice(index, 1);
      if (this.newQuestion.correctAnswerIndex >= index && this.newQuestion.correctAnswerIndex > 0) {
        this.newQuestion.correctAnswerIndex--;
      }
    }
  }

  addEditOption() {
    if (this.editingQuestion) {
      this.editingQuestion.options.push('');
    }
  }

  removeEditOption(index: number) {
    if (this.editingQuestion && this.editingQuestion.options.length > 2) {
      this.editingQuestion.options.splice(index, 1);
      if (this.editingQuestion.correctAnswerIndex >= index && this.editingQuestion.correctAnswerIndex > 0) {
        this.editingQuestion.correctAnswerIndex--;
      }
    }
  }

  resetForm() {
    this.newQuestion = {
      questionText: '',
      options: ['', ''],
      correctAnswerIndex: 0,
      points: 1
    };
    this.isCreating = false;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}