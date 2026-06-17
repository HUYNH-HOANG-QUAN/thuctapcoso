package com.doan.ProFit.dto.request;

import jakarta.validation.constraints.NotBlank;

public class MessageRequest {
    @NotBlank(message = "Chủ đề không được trống")
    private String subject;

    @NotBlank(message = "Nội dung không được trống")
    private String content;

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
