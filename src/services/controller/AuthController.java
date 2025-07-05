package com.example.lostandfound.controller;

import com.example.lostandfound.dto.ApiResponse;
import com.example.lostandfound.dto.LoginDto;
import com.example.lostandfound.dto.UserDto;
import com.example.lostandfound.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired
    private UserService userService;

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@Valid @RequestBody UserDto userDto) {
        Map<String, Object> result = userService.register(userDto);
        boolean success = (Boolean) result.get("success");
        String message = (String) result.get("message");
        if (success) {
            Map<String, Object> data = new java.util.HashMap<>();
            data.put("userId", result.get("userId"));
            return ResponseEntity.ok(ApiResponse.success(message, data));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error(message));
        }
    }

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody LoginDto loginDto) {
        Map<String, Object> result = userService.login(loginDto);
        boolean success = (Boolean) result.get("success");
        String message = (String) result.get("message");
        if (success) {
            Map<String, Object> data = new java.util.HashMap<>();
            data.put("user", result.get("user"));
            data.put("token", result.get("token"));
            return ResponseEntity.ok(ApiResponse.success(message, data));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error(message));
        }
    }

    /**
     * 忘记密码-重置密码
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        String studentNo = body.get("studentNo");
        String fullName = body.get("fullName");
        String newPassword = body.get("newPassword");
        Map<String, Object> result = userService.resetPassword(phone, studentNo, fullName, newPassword);
        boolean success = (Boolean) result.get("success");
        String message = (String) result.get("message");
        if (success) {
            return ResponseEntity.ok(ApiResponse.success(message));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error(message));
        }
    }
} 