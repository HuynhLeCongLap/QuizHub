package com.quizhub.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "questions")
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_text")
    private String questionText;

    @Column(name = "options", columnDefinition = "JSON")
    @JsonIgnore
    private String optionsJson;

    @Column(name = "correct_answer_index")
    private int correctAnswerIndex;

    @Column(name = "points", nullable = false)
    private int points = 1;

    @ManyToOne
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    @Transient
    private List<String> options;

    // Custom getter and setter for options
    @JsonProperty("options")
    public List<String> getOptions() {
        if (options == null && optionsJson != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                options = mapper.readValue(optionsJson, new TypeReference<List<String>>() {});
            } catch (Exception e) {
                options = new java.util.ArrayList<>();
            }
        }
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
        if (options != null) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                this.optionsJson = mapper.writeValueAsString(options);
            } catch (Exception e) {
                this.optionsJson = null;
            }
        } else {
            this.optionsJson = null;
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public int getCorrectAnswerIndex() { return correctAnswerIndex; }
    public void setCorrectAnswerIndex(int correctAnswerIndex) { this.correctAnswerIndex = correctAnswerIndex; }

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }

    @JsonIgnore
    public Quiz getQuiz() { return quiz; }
    public void setQuiz(Quiz quiz) { this.quiz = quiz; }

    public String getOptionsJson() { return optionsJson; }
    public void setOptionsJson(String optionsJson) { this.optionsJson = optionsJson; }
}