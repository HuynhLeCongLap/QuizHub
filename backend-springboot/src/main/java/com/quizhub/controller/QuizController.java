package com.quizhub.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quizhub.dto.QuestionDTO;
import com.quizhub.dto.QuizDTO;
import com.quizhub.entity.Question;
import com.quizhub.entity.Quiz;
import com.quizhub.entity.User;
import com.quizhub.repository.QuestionRepository;
import com.quizhub.repository.QuizRepository;
import com.quizhub.repository.UserRepository;


@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin(origins = "http://localhost:4200")
public class QuizController {

    private final QuizRepository quizRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;

    public QuizController(QuizRepository quizRepository, UserRepository userRepository, QuestionRepository questionRepository) {
        this.quizRepository = quizRepository;
        this.userRepository = userRepository;
        this.questionRepository = questionRepository;
    }

    @GetMapping
    public ResponseEntity<List<QuizDTO>> getAllQuizzes() {
        List<Quiz> quizzes = quizRepository.findAll();
        List<QuizDTO> quizDTOs = quizzes.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(quizDTOs);
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ResponseEntity<QuizDTO> getQuizById(@PathVariable Long id) {
        return quizRepository.findById(id)
                .or(() -> quizRepository.findById(1L))  // Fallback to quiz id 1 if not found
                .map(quiz -> ResponseEntity.ok(convertToDTO(quiz)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/questions")
    @Transactional(readOnly = true)
    public ResponseEntity<List<Question>> getQuizQuestions(@PathVariable Long id) {
        return quizRepository.findById(id)
                .or(() -> quizRepository.findById(1L))  // Fallback to quiz id 1 if not found
                .map(quiz -> ResponseEntity.ok(quiz.getQuestions()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<QuizDTO> createQuiz(@RequestBody QuizDTO quizDTO) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = ((UserDetails) principal).getUsername();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        User creator = userOpt.get();
        Quiz quiz = convertToEntity(quizDTO);
        quiz.setCreator(creator);
        Quiz savedQuiz = quizRepository.save(quiz);
        return ResponseEntity.ok(convertToDTO(savedQuiz));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<QuizDTO> updateQuiz(@PathVariable Long id, @RequestBody QuizDTO quizDTO) {
        return quizRepository.findById(id)
                .map(quiz -> {
                    quiz.setTitle(quizDTO.getTitle());
                    quiz.setDuration(quizDTO.getDuration());
                    quiz.setOpen(quizDTO.isOpen());
                    // Update questions
                    Map<Long, Question> oldQuestions = quiz.getQuestions()
                        .stream()
                        .collect(Collectors.toMap(Question::getId, q -> q));

                    List<Question> updated = new ArrayList<>();

                    if (quizDTO.getQuestions() != null) {
                        for (QuestionDTO qDTO : quizDTO.getQuestions()) {
                            if (qDTO.getId() != null && oldQuestions.containsKey(qDTO.getId())) {
                                // UPDATE existing question
                                Question existing = oldQuestions.get(qDTO.getId());
                                existing.setQuestionText(qDTO.getQuestionText());
                                try {
                                    ObjectMapper mapper = new ObjectMapper();
                                    existing.setOptionsJson(mapper.writeValueAsString(qDTO.getOptions()));
                                } catch (Exception e) {
                                    existing.setOptionsJson("[]");
                                }
                                existing.setCorrectAnswerIndex(qDTO.getCorrectAnswerIndex());
                                existing.setPoints(qDTO.getPoints());
                                updated.add(existing);
                            } else {
                                // INSERT new question
                                Question question = new Question();
                                question.setQuestionText(qDTO.getQuestionText());
                                try {
                                    ObjectMapper mapper = new ObjectMapper();
                                    question.setOptionsJson(mapper.writeValueAsString(qDTO.getOptions()));
                                } catch (Exception e) {
                                    question.setOptionsJson("[]");
                                }
                                question.setCorrectAnswerIndex(qDTO.getCorrectAnswerIndex());
                                question.setPoints(qDTO.getPoints());
                                question.setQuiz(quiz);
                                updated.add(question);
                            }
                        }
                    }

                    // Orphan questions that are no longer in the quiz (set quiz_id to null)
                    Set<Long> updatedIds = updated.stream()
                        .map(Question::getId)
                        .filter(Objects::nonNull)
                        .collect(Collectors.toSet());
                    List<Question> toOrphan = oldQuestions.values().stream()
                        .filter(q -> !updatedIds.contains(q.getId()))
                        .collect(Collectors.toList());
                    for (Question q : toOrphan) {
                        q.setQuiz(null);
                        questionRepository.save(q);
                    }

                    // Clear and add updated questions
                    quiz.getQuestions().clear();
                    quiz.getQuestions().addAll(updated);

                    Quiz updatedQuiz = quizRepository.save(quiz);
                    return ResponseEntity.ok(convertToDTO(updatedQuiz));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{quizId}/questions/{questionId}")
    public ResponseEntity<QuizDTO> addQuestionToQuiz(@PathVariable Long quizId, @PathVariable Long questionId) {
        return quizRepository.findById(quizId)
                .flatMap(quiz -> questionRepository.findById(questionId)
                        .map(question -> {
                            question.setQuiz(quiz);
                            questionRepository.save(question);
                            return ResponseEntity.ok(convertToDTO(quizRepository.save(quiz)));
                        }))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        Optional<Quiz> quizOpt = quizRepository.findById(id);
        if (quizOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Quiz quiz = quizOpt.get();
        // Admin can delete any quiz
        quizRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private QuizDTO convertToDTO(Quiz quiz) {
        List<QuestionDTO> questionDTOs = quiz.getQuestions().stream()
                .map(q -> {
                    String[] options = {};
                    try {
                        ObjectMapper mapper = new ObjectMapper();
                        options = mapper.readValue(q.getOptionsJson(), String[].class);
                    } catch (Exception e) {
                        // Handle parse error
                    }
                    return new QuestionDTO(q.getId(), q.getQuestionText(), options, q.getCorrectAnswerIndex(), quiz.getId(), q.getPoints());
                })
                .collect(Collectors.toList());
        return new QuizDTO(
                quiz.getId(),
                quiz.getTitle(),
                quiz.getDuration(),
                quiz.getCreator() != null ? quiz.getCreator().getId() : null,
                quiz.isOpen(),
                questionDTOs
        );
    }

    private Quiz convertToEntity(QuizDTO quizDTO) {
        Quiz quiz = new Quiz();
        quiz.setTitle(quizDTO.getTitle());
        quiz.setDuration(quizDTO.getDuration());
        quiz.setOpen(quizDTO.isOpen());
        if (quizDTO.getQuestions() != null) {
            List<Question> questions = quizDTO.getQuestions().stream()
                    .map(qDTO -> {
                        Question q = new Question();
                        q.setQuestionText(qDTO.getQuestionText());
                        try {
                            ObjectMapper mapper = new ObjectMapper();
                            q.setOptionsJson(mapper.writeValueAsString(qDTO.getOptions()));
                        } catch (Exception e) {
                            q.setOptionsJson("[]");
                        }
                        q.setCorrectAnswerIndex(qDTO.getCorrectAnswerIndex());
                        q.setPoints(qDTO.getPoints());
                        q.setQuiz(quiz);
                        return q;
                    })
                    .collect(Collectors.toList());
            quiz.setQuestions(questions);
        }
        return quiz;
    }
}