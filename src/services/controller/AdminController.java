package com.example.lostandfound.controller;

import com.example.lostandfound.dto.AdminDto;
import com.example.lostandfound.dto.ApiResponse;
import com.example.lostandfound.entity.User;
import com.example.lostandfound.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * 超级管理员创建普通管理员
     * 注意：此接口只允许超级管理员访问
     */
    @PostMapping("/create-manager")
    @PreAuthorize("hasAuthority('超级管理员')")
    public ApiResponse<Map<String, Object>> createManager(@RequestBody AdminDto adminDto) {
        // 验证请求参数
        if (adminDto.getUsername() == null || adminDto.getPassword() == null || adminDto.getFullName() == null) {
            return ApiResponse.error("用户名、密码和姓名不能为空");
        }
        
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(adminDto.getUsername())) {
            return ApiResponse.error("用户名已存在");
        }
        
        // 创建普通管理员账号
        User manager = new User();
        manager.setUsername(adminDto.getUsername());
        manager.setPassword(passwordEncoder.encode(adminDto.getPassword()));
        manager.setRole(User.ROLE_ADMIN); // 固定为普通管理员
        manager.setFullName(adminDto.getFullName());
        manager.setPhone(adminDto.getPhone()); // 可选
        manager.setStatus("正常");
        manager.setAvatarUrl(adminDto.getAvatarUrl() != null ? 
                adminDto.getAvatarUrl() : "/uploads/default-avatar.png");
        
        // 保存管理员账号
        User savedManager = userRepository.save(manager);
        
        // 构建响应数据
        Map<String, Object> data = new HashMap<>();
        data.put("id", savedManager.getId());
        data.put("username", savedManager.getUsername());
        data.put("role", savedManager.getRole());
        
        return ApiResponse.success("管理员创建成功", data);
    }
    
    /**
     * 获取管理员列表（仅超级管理员可访问）
     */
    @GetMapping("/managers")
    @PreAuthorize("hasAuthority('超级管理员')")
    public ApiResponse<Page<User>> getManagers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Map<String, String> params) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        
        Specification<User> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // 只查询普通管理员
            predicates.add(criteriaBuilder.equal(root.get("role"), User.ROLE_ADMIN));
            
            // 根据用户名模糊搜索
            if (params.containsKey("username") && params.get("username") != null) {
                predicates.add(criteriaBuilder.like(root.get("username"), "%" + params.get("username") + "%"));
            }
            
            // 根据姓名模糊搜索
            if (params.containsKey("fullName") && params.get("fullName") != null) {
                predicates.add(criteriaBuilder.like(root.get("fullName"), "%" + params.get("fullName") + "%"));
            }
            
            // 根据状态精确搜索
            if (params.containsKey("status") && params.get("status") != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), params.get("status")));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        
        Page<User> managers = userRepository.findAll(spec, pageable);
        return ApiResponse.success("获取管理员列表成功", managers);
    }
    
    /**
     * 禁用/启用管理员（仅超级管理员可访问）
     */
    @PutMapping("/manager-status/{managerId}")
    @PreAuthorize("hasAuthority('超级管理员')")
    public ApiResponse<Map<String, Object>> updateManagerStatus(
            @PathVariable Integer managerId, 
            @RequestBody Map<String, String> request) {
        
        String status = request.get("status");
        if (status == null || (!status.equals("正常") && !status.equals("禁用"))) {
            return ApiResponse.error("状态值无效，应为'正常'或'禁用'");
        }
        
        // 查找管理员
        User manager = userRepository.findById(managerId).orElse(null);
        if (manager == null) {
            return ApiResponse.error("管理员不存在");
        }
        
        // 验证是否为普通管理员
        if (!manager.isNormalAdmin()) {
            return ApiResponse.error("只能修改普通管理员账号的状态");
        }
        
        // 更新状态
        manager.setStatus(status);
        userRepository.save(manager);
        
        Map<String, Object> data = new HashMap<>();
        data.put("id", manager.getId());
        data.put("username", manager.getUsername());
        data.put("status", manager.getStatus());
        
        return ApiResponse.success("管理员状态更新成功", data);
    }
} 