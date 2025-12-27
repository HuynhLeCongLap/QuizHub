package com.quizhub.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class QuestionDTO {
    private Long id;
    private String questionText;
    private String[] options;
    private int correctAnswerIndex;
    private Long quizId;
    private int points;

    public QuestionDTO() {}

    public QuestionDTO(Long id, String questionText, String[] options, int correctAnswerIndex, Long quizId, int points) {
        this.id = id;
        this.questionText = questionText;
        this.options = options;
        this.correctAnswerIndex = correctAnswerIndex;
        this.quizId = quizId;
        this.points = points;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public String[] getOptions() { return options; }
    public void setOptions(String[] options) { this.options = options; }

    public int getCorrectAnswerIndex() { return correctAnswerIndex; }
    public void setCorrectAnswerIndex(int correctAnswerIndex) { this.correctAnswerIndex = correctAnswerIndex; }

    public Long getQuizId() { return quizId; }
    public void setQuizId(Long quizId) { this.quizId = quizId; }

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
}