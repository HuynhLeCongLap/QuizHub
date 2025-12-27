package com.quizhub.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quizhub.dto.ResultDTO;
import com.quizhub.entity.Quiz;
import com.quizhub.entity.Result;
import com.quizhub.entity.User;
import com.quizhub.repository.QuizRepository;
import com.quizhub.repository.ResultRepository;
import com.quizhub.repository.UserRepository;

@RestController
@RequestMapping("/api/results")
@CrossOrigin(origins = "http://localhost:4200")
public class ResultController {

    private final ResultRepository resultRepository;
    private final UserRepository userRepository;
    private final QuizRepository quizRepository;

    public ResultController(ResultRepository resultRepository, UserRepository userRepository, QuizRepository quizRepository) {
        this.resultRepository = resultRepository;
        this.userRepository = userRepository;
        this.quizRepository = quizRepository;
    }

    @PostMapping
    public ResponseEntity<ResultDTO> submitResult(@RequestBody ResultDTO resultDTO) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = ((UserDetails) principal).getUsername();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        User user = userOpt.get();

        Optional<Quiz> quizOpt = quizRepository.findById(resultDTO.getQuizId());
        if (quizOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Quiz quiz = quizOpt.get();

        Result result = new Result();
        result.setScore(resultDTO.getScore());
        result.setUser(user);
        result.setQuiz(quiz);
        result.setCompletedAt(LocalDateTime.now());

        Result savedResult = resultRepository.save(result);
        return ResponseEntity.ok(convertToDTO(savedResult));
    }

    @GetMapping
    public ResponseEntity<List<ResultDTO>> getAllResults() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username = ((UserDetails) principal).getUsername();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        User user = userOpt.get();

        List<Result> results;
        if ("ADMIN".equals(user.getRole())) {
            results = resultRepository.findAll();
        } else {
            results = resultRepository.findByUserId(user.getId());
        }

        List<ResultDTO> resultDTOs = results.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(resultDTOs);
    }

    private ResultDTO convertToDTO(Result result) {
        return new ResultDTO(
                result.getId(),
                result.getScore(),
                result.getUser().getId(),
                result.getUser().getFullName(),
                result.getQuiz().getId(),
                result.getQuiz().getTitle(),
                result.getCompletedAt()
        );
    }
}