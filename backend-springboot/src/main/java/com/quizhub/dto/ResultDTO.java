package com.quizhub.dto;

import java.time.LocalDateTime;

public class ResultDTO {
    private Long id;
    private int score;
    private Long userId;
    private String full_name;
    private Long quizId;
    private String quizTitle;
    private LocalDateTime completedAt;

    // Constructors, Getters, Setters
    public ResultDTO() {}

    public ResultDTO(Long id, int score, Long userId, String full_name, Long quizId, String quizTitle, LocalDateTime completedAt) {
        this.id = id;
        this.score = score;
        this.userId = userId;
        this.full_name = full_name;
        this.quizId = quizId;
        this.quizTitle = quizTitle;
        this.completedAt = completedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getFull_name() { return full_name; }
    public void setFull_name(String full_name) { this.full_name = full_name; }

    public Long getQuizId() { return quizId; }
    public void setQuizId(Long quizId) { this.quizId = quizId; }

    public String getQuizTitle() { return quizTitle; }
    public void setQuizTitle(String quizTitle) { this.quizTitle = quizTitle; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}