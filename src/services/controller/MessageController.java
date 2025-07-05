package com.example.lostandfound.controller;

import com.example.lostandfound.dto.ApiResponse;
import com.example.lostandfound.dto.MessageDto;
import com.example.lostandfound.entity.Message;
import com.example.lostandfound.service.MessageService;
import com.example.lostandfound.util.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * 从token中提取用户ID（不强制要求有效token）
     */
    private Integer getUserIdFromToken(String token) {
        if (token != null) {
            try {
                return jwtUtil.getUserIdFromToken(token);
            } catch (Exception e) {
                // 无效的token，忽略
            }
        }
        return null;
    }
    
    /**
     * 验证token并返回用户ID，如果无效则抛出异常
     */
    private Integer validateTokenAndGetUserId(String token) {
        try {
            return jwtUtil.getUserIdFromToken(token);
        } catch (Exception e) {
            throw new IllegalArgumentException("未授权");
        }
    }
    
    /**
     * 获取留言列表（分页）
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMessages(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestHeader(value = "token", required = false) String token) {
        
        Integer currentUserId = getUserIdFromToken(token);
        
        Page<Message> messagesPage = messageService.getMessages(page, size, currentUserId);
        
        List<MessageDto> messageDtos = messageService.convertToDtoList(
                messagesPage.getContent(),
                currentUserId
        );
        
        Map<String, Object> data = new HashMap<>();
        data.put("messages", messageDtos);
        data.put("currentPage", messagesPage.getNumber() + 1);
        data.put("totalPages", messagesPage.getTotalPages());
        data.put("totalMessages", messagesPage.getTotalElements());
        
        return ResponseEntity.ok(new ApiResponse<>(true, "获取留言列表成功", data));
    }
    
    /**
     * 获取留言的回复列表
     */
    @GetMapping("/{messageId}/replies")
    public ResponseEntity<ApiResponse<List<MessageDto>>> getReplies(
            @PathVariable Integer messageId,
            @RequestHeader(value = "token", required = false) String token) {
        
        Integer currentUserId = getUserIdFromToken(token);
        
        List<Message> replies = messageService.getReplies(messageId, currentUserId);
        List<MessageDto> replyDtos = messageService.convertToDtoList(replies, currentUserId);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "获取回复列表成功", replyDtos));
    }
    
    /**
     * 发表留言或回复
     */
    @PostMapping
    public ResponseEntity<ApiResponse<MessageDto>> createMessage(
            @RequestBody Map<String, Object> payload,
            @RequestHeader("token") String token) {
        
        // 验证用户
        Integer userId;
        try {
            userId = validateTokenAndGetUserId(token);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
        
        String content = (String) payload.get("content");
        Integer parentId = payload.get("parentId") != null ? 
                Integer.valueOf(payload.get("parentId").toString()) : null;
        
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, "留言内容不能为空", null));
        }
        
        try {
            Message message = messageService.createMessage(userId, content, parentId);
            MessageDto messageDto = messageService.convertToDto(message, userId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, "留言成功", messageDto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    /**
     * 删除留言
     */
    @DeleteMapping("/{messageId}")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @PathVariable Integer messageId,
            @RequestHeader("token") String token) {
        
        // 验证用户
        Integer userId;
        try {
            userId = validateTokenAndGetUserId(token);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
        
        try {
            messageService.deleteMessage(messageId, userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "删除留言成功", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    /**
     * 点赞/取消点赞
     */
    @PostMapping("/{messageId}/like")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleLike(
            @PathVariable Integer messageId,
            @RequestHeader("token") String token) {
        
        // 验证用户
        Integer userId;
        try {
            userId = validateTokenAndGetUserId(token);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
        
        try {
            boolean isLiked = messageService.toggleLike(messageId, userId);
            String message = isLiked ? "点赞成功" : "取消点赞成功";
            
            Map<String, Object> data = new HashMap<>();
            data.put("liked", isLiked);
            
            return ResponseEntity.ok(new ApiResponse<>(true, message, data));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    /**
     * 获取系统留言统计信息
     * 包括：总留言数、总回复数、总点赞数
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMessageStats() {
        Map<String, Object> stats = messageService.getMessageStats();
        return ResponseEntity.ok(new ApiResponse<>(true, "获取留言统计信息成功", stats));
    }
    
    /**
     * 获取单个留言的统计信息
     * 包括：点赞数、回复数
     */
    @GetMapping("/{messageId}/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMessageDetailStats(
            @PathVariable Integer messageId) {
        try {
            Map<String, Object> stats = messageService.getMessageDetailStats(messageId);
            return ResponseEntity.ok(new ApiResponse<>(true, "获取留言详情统计成功", stats));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    /**
     * 获取指定用户的留言统计信息
     * 包括：发表的留言数、发表的回复数、获得的点赞数
     */
    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserMessageStats(
            @PathVariable Integer userId) {
        try {
            Map<String, Object> stats = messageService.getUserMessageStats(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "获取用户留言统计成功", stats));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
    
    /**
     * 获取当前登录用户的留言统计信息
     * 包括：发表的留言数、发表的回复数、获得的点赞数
     */
    @GetMapping("/user/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUserMessageStats(
            @RequestHeader("token") String token) {
        try {
            Integer userId = validateTokenAndGetUserId(token);
            Map<String, Object> stats = messageService.getUserMessageStats(userId);
            return ResponseEntity.ok(new ApiResponse<>(true, "获取个人留言统计成功", stats));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }
} 