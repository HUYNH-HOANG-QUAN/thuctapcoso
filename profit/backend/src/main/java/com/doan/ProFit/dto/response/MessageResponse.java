package com.doan.ProFit.dto.response;

import com.doan.ProFit.entity.Message;
import com.doan.ProFit.entity.User;

import java.time.LocalDateTime;

public class MessageResponse {
    private Long id;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private String userPhone;
    private String subject;
    private String content;
    private String status;
    private String replyContent;
    private LocalDateTime repliedAt;
    private LocalDateTime createdAt;

    public static MessageResponse fromEntity(Message message) {
        MessageResponse r = new MessageResponse();
        r.setId(message.getId());
        r.setSubject(message.getSubject());
        r.setContent(message.getContent());
        r.setStatus(message.getStatus());
        r.setReplyContent(message.getReplyContent());
        r.setRepliedAt(message.getRepliedAt());
        r.setCreatedAt(message.getCreatedAt());

        User user = message.getUser();
        if (user != null) {
            r.setUserId(user.getId());
            r.setUserFullName(user.getFullName());
            r.setUserEmail(user.getEmail());
            r.setUserPhone(user.getPhone());
        }
        return r;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getUserPhone() { return userPhone; }
    public void setUserPhone(String userPhone) { this.userPhone = userPhone; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReplyContent() { return replyContent; }
    public void setReplyContent(String replyContent) { this.replyContent = replyContent; }
    public LocalDateTime getRepliedAt() { return repliedAt; }
    public void setRepliedAt(LocalDateTime repliedAt) { this.repliedAt = repliedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
