package com.quizhub.dto;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public class QuizDTO {
    private Long id;
    private String title;
    private int duration;
    private Long createdBy;
    @JsonProperty("open")
    private boolean open;
    private List<QuestionDTO> questions;

    // Constructors, Getters, Setters
    public QuizDTO() {}

    public QuizDTO(Long id, String title, int duration, Long createdBy, boolean open, List<QuestionDTO> questions) {
        this.id = id;
        this.title = title;
        this.duration = duration;
        this.createdBy = createdBy;
        this.open = open;
        this.questions = questions;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public int getDuration() { return duration; }
    public void setDuration(int duration) { this.duration = duration; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public boolean isOpen() { return open; }
    public void setOpen(boolean open) { this.open = open; }

    public List<QuestionDTO> getQuestions() { return questions; }
    public void setQuestions(List<QuestionDTO> questions) { this.questions = questions; }
}