package com.example.lostandfound.controller;

import com.example.lostandfound.dto.ApiResponse;
import com.example.lostandfound.dto.UserDto;
import com.example.lostandfound.entity.User;
import com.example.lostandfound.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    
    @Autowired
    private UserService userService;
    
    // ==================== 用户个人接口 ====================
    
    /**
     * 获取个人信息
     * 测试阶段：允许任何请求访问任何用户信息
     */
    @GetMapping("/{userId}/profile")
    public ApiResponse<UserDto> getProfile(@PathVariable Integer userId) {
        // 测试阶段：移除权限检查
        Optional<User> userOpt = userService.getUserById(userId);
        if (userOpt.isEmpty()) {
            return ApiResponse.error("用户不存在");
        }
        
        User user = userOpt.get();
        UserDto userDto = new UserDto();
        userDto.setId(user.getId());
        userDto.setUsername(user.getUsername());
        userDto.setRole(user.getRole());
        userDto.setPhone(user.getPhone());
        userDto.setStudentNo(user.getStudentNo());
        userDto.setFullName(user.getFullName());
        userDto.setAvatarUrl(user.getAvatarUrl());
        userDto.setStatus(user.getStatus());
        return ApiResponse.success("查询成功", userDto);
    }

    /**
     * 修改个人信息
     * 测试阶段：允许任何请求修改任何用户信息
     */
    @PutMapping("/{userId}/profile")
    public ApiResponse<Void> updateProfile(@PathVariable Integer userId, @RequestBody UserDto userDto) {
        // 测试阶段：移除权限检查
        User updatedUser = userService.updateUser(userId, userDto);
        if (updatedUser != null) {
            return ApiResponse.success("个人信息更新成功");
        } else {
            return ApiResponse.error("更新失败，用户不存在");
        }
    }

    /**
     * 上传头像
     * 测试阶段：允许任何请求为任何用户上传头像
     */
    @PostMapping("/{userId}/avatar")
    public ApiResponse<String> uploadAvatar(@PathVariable Integer userId, @RequestParam("file") MultipartFile file) {
        // 检查文件是否为空
        if (file == null || file.isEmpty()) {
            return ApiResponse.error("请选择要上传的头像文件");
        }
        
        // 检查文件类型
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ApiResponse.error("只能上传图片文件");
        }
        
        // 检查文件大小
        if (file.getSize() > 10 * 1024 * 1024) { // 10MB
            return ApiResponse.error("文件大小不能超过10MB");
        }
        
        try {
            logger.info("开始上传头像，用户ID: {}", userId);
            logger.info("文件名: {}", file.getOriginalFilename());
            logger.info("文件类型: {}", file.getContentType());
            logger.info("文件大小: {} bytes", file.getSize());
            
            String avatarUrl = userService.uploadAvatar(userId, file);
            logger.info("头像上传成功，URL: {}", avatarUrl);
            return ApiResponse.success("上传成功", avatarUrl);
        } catch (Exception e) {
            logger.error("头像上传失败: {}", e.getMessage(), e);
            return ApiResponse.error("头像上传失败: " + e.getMessage());
        }
    }
    
    // ==================== 管理员接口 ====================
    
    /**
     * 将普通用户提升为管理员
     * 测试阶段：移除超级管理员权限限制
     */
    @PutMapping("/{userId}/promote")
    // 测试阶段：移除权限注解
    // @PreAuthorize("hasAuthority('超级管理员')")
    public ApiResponse<Map<String, Object>> promoteToAdmin(@PathVariable Integer userId) {
        Optional<User> userOpt = userService.getUserById(userId);
        if (userOpt.isEmpty()) {
            return ApiResponse.error("用户不存在");
        }
        
        User user = userOpt.get();
        if (!user.isStudent()) {
            return ApiResponse.error("只能将普通用户提升为管理员");
        }
        
        user.setRole(User.ROLE_ADMIN);
        User updatedUser = userService.updateUser(userId, UserDto.fromUser(user));
        
        Map<String, Object> data = new HashMap<>();
        data.put("id", updatedUser.getId());
        data.put("username", updatedUser.getUsername());
        data.put("role", updatedUser.getRole());
        
        return ApiResponse.success("已将用户提升为管理员", data);
    }
    
    /**
     * 将管理员降级为普通用户
     * 测试阶段：移除超级管理员权限限制
     */
    @PutMapping("/{userId}/demote")
    // 测试阶段：移除权限注解
    // @PreAuthorize("hasAuthority('超级管理员')")
    public ApiResponse<Map<String, Object>> demoteToUser(@PathVariable Integer userId) {
        Optional<User> userOpt = userService.getUserById(userId);
        if (userOpt.isEmpty()) {
            return ApiResponse.error("用户不存在");
        }
        
        User user = userOpt.get();
        if (!user.isNormalAdmin()) {
            return ApiResponse.error("只能将普通管理员降级为普通用户");
        }
        
        user.setRole(User.ROLE_USER);
        User updatedUser = userService.updateUser(userId, UserDto.fromUser(user));
        
        Map<String, Object> data = new HashMap<>();
        data.put("id", updatedUser.getId());
        data.put("username", updatedUser.getUsername());
        data.put("role", updatedUser.getRole());
        
        return ApiResponse.success("已将管理员降级为普通用户", data);
    }

    /**
     * 获取用户详情（管理员使用）
     * 测试阶段：允许任何请求访问
     */
    @GetMapping("/{userId}")
    public ApiResponse<User> getUserDetail(@PathVariable Integer userId) {
        User user = userService.findById(userId);
        
        if (user == null) {
            return ApiResponse.error("用户不存在");
        }
        
        return ApiResponse.success("获取用户详情成功", user);
    }
    
    /**
     * 禁用用户（管理员使用）
     * 测试阶段：允许任何请求访问
     */
    @PutMapping("/{userId}/disable")
    public ApiResponse<Map<String, Object>> disableUser(@PathVariable Integer userId) {
        User user = userService.updateUserStatus(userId, "禁用");
        if (user == null) {
            return ApiResponse.error("用户不存在");
        }
        
        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("username", user.getUsername());
        data.put("status", user.getStatus());
        
        return ApiResponse.success("用户已禁用", data);
    }
    
    /**
     * 启用用户（管理员使用）
     * 测试阶段：允许任何请求访问
     */
    @PutMapping("/{userId}/enable")
    public ApiResponse<Map<String, Object>> enableUser(@PathVariable Integer userId) {
        User user = userService.updateUserStatus(userId, "正常");
        if (user == null) {
            return ApiResponse.error("用户不存在");
        }
        
        Map<String, Object> data = new HashMap<>();
        data.put("id", user.getId());
        data.put("username", user.getUsername());
        data.put("status", user.getStatus());
        
        return ApiResponse.success("用户已启用", data);
    }
    
    /**
     * 分页查询用户列表（管理员使用）
     * 支持多条件筛选：关键字、角色、状态
     * 测试阶段：允许任何请求访问
     */
    @GetMapping("/page")
    public ApiResponse<Map<String, Object>> getUsersByPage(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {
        
        Page<User> userPage = userService.getUsersByCondition(keyword, role, status, page, size, sortBy, sortDirection);
        
        // 转换为DTO对象，避免循环引用
        List<UserDto> userDtos = new ArrayList<>();
        for (User user : userPage.getContent()) {
            UserDto dto = new UserDto();
            dto.setId(user.getId());
            dto.setUsername(user.getUsername());
            dto.setRole(user.getRole());
            dto.setPhone(user.getPhone());
            dto.setStudentNo(user.getStudentNo());
            dto.setFullName(user.getFullName());
            dto.setAvatarUrl(user.getAvatarUrl());
            dto.setStatus(user.getStatus());
            // 不设置密码，避免敏感信息泄露
            userDtos.add(dto);
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("users", userDtos);
        response.put("currentPage", userPage.getNumber());
        response.put("totalItems", userPage.getTotalElements());
        response.put("totalPages", userPage.getTotalPages());
        
        return ApiResponse.success("查询成功", response);
    }
} 