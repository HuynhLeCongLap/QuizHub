package com.quizhub.repository;

import com.quizhub.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByQuizId(Long quizId);

    @Query("SELECT q FROM Question q WHERE q.quiz IS NULL")
    List<Question> findLibraryQuestions();
}