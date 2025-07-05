package com.example.lostandfound.controller;

import com.example.lostandfound.dto.AnnouncementDto;
import com.example.lostandfound.dto.ApiResponse;
import com.example.lostandfound.service.AnnouncementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/announcements")
public class AnnouncementController {
    @Autowired
    private AnnouncementService announcementService;

    // 管理员：新增公告
    @PostMapping("")
    public ApiResponse<AnnouncementDto> create(@RequestBody AnnouncementDto dto) {
        return ApiResponse.success("新增成功", announcementService.create(dto));
    }

    // 管理员：编辑公告
    @PutMapping("/{id}")
    public ApiResponse<AnnouncementDto> update(@PathVariable Integer id, @RequestBody AnnouncementDto dto) {
        return ApiResponse.success("修改成功", announcementService.update(id, dto));
    }

    // 管理员：逻辑删除公告（下线）
    @PutMapping("/{id}/offline")
    public ApiResponse<Void> offline(@PathVariable Integer id) {
        announcementService.offline(id);
        return ApiResponse.success("下线成功");
    }

    // 管理员：物理删除公告
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Integer id) {
        announcementService.delete(id);
        return ApiResponse.success("删除成功");
    }

    // 管理员/用户：公告详情
    @GetMapping("/{id}")
    public ApiResponse<AnnouncementDto> getById(@PathVariable Integer id) {
        return ApiResponse.success("查询成功", announcementService.getById(id));
    }

    // 管理员：分页列表（可筛选、可搜索）
    @GetMapping("")
    public ApiResponse<Page<AnnouncementDto>> list(@RequestParam(required = false) String status,
                                                   @RequestParam(required = false) String keyword,
                                                   @RequestParam(defaultValue = "1") int page,
                                                   @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("查询成功", announcementService.list(status, keyword, page, size));
    }

    // 用户：只读可见公告列表
    @GetMapping("/visible")
    public ApiResponse<List<AnnouncementDto>> visibleList() {
        return ApiResponse.success("查询成功", announcementService.visibleList());
    }
} 