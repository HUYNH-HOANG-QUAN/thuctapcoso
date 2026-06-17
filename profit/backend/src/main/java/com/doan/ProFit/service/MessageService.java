package com.doan.ProFit.service;

import com.doan.ProFit.dto.request.MessageReplyRequest;
import com.doan.ProFit.dto.request.MessageRequest;
import com.doan.ProFit.dto.response.MessageResponse;
import com.doan.ProFit.entity.Message;
import com.doan.ProFit.entity.User;
import com.doan.ProFit.repository.MessageRepository;
import com.doan.ProFit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<MessageResponse> getMessagesByUserEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return messageRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(MessageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MessageResponse> getAllMessages() {
        return messageRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(MessageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse createMessage(MessageRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Message message = new Message();
        message.setUser(user);
        message.setSubject(request.getSubject());
        message.setContent(request.getContent());
        message.setStatus("UNREAD");

        Message saved = messageRepository.save(message);
        return MessageResponse.fromEntity(saved);
    }

    @Transactional
    public MessageResponse replyToMessage(Long messageId, MessageReplyRequest request) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        message.setReplyContent(request.getReplyContent());
        message.setRepliedAt(LocalDateTime.now());
        message.setStatus("REPLIED");

        Message saved = messageRepository.save(message);
        return MessageResponse.fromEntity(saved);
    }

    @Transactional
    public void markAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        message.setStatus("READ");
        messageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        return messageRepository.countByStatus("UNREAD");
    }

    @Transactional(readOnly = true)
    public MessageResponse getMessageById(Long id) {
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        return MessageResponse.fromEntity(message);
    }
}
