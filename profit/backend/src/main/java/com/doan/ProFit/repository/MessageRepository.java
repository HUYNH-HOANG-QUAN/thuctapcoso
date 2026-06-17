package com.doan.ProFit.repository;

import com.doan.ProFit.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Message> findAllByOrderByCreatedAtDesc();

    @Query("SELECT m FROM Message m WHERE m.user.id = :userId AND m.status = :status ORDER BY m.createdAt DESC")
    List<Message> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") String status);

    long countByStatus(String status);
}
