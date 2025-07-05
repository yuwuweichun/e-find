package com.example.lostandfound.controller;

import com.example.lostandfound.dto.ApiResponse;
import com.example.lostandfound.entity.Item;
import com.example.lostandfound.entity.Photo;
import com.example.lostandfound.service.ItemService;
import com.example.lostandfound.dto.ItemDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/items")
// 删除@CrossOrigin注解，因为已在WebMvcConfig中全局配置
public class ItemController {
    
    private static final Logger logger = LoggerFactory.getLogger(ItemController.class);
    
    @Autowired
    private final ItemService itemService;
    
    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }
    
    /**
     * 多条件分页查询失物/拾物
     * 
     * @param type 物品类型：lost（失物）、found（拾物）
     * @param status 物品状态：审核中、已通过、未通过
     * @param date 日期筛选
     * @param order 排序方式：asc（升序）、desc（降序）
     * @param keyword 关键词搜索（标题、描述、地点）
     * @param publisherId 发布者ID
     * @param page 页码（从1开始）
     * @param size 每页大小
     */
    @GetMapping("")
    public ApiResponse<Page<Item>> getItems(
            @RequestParam(required = false) final String type,
            @RequestParam(required = false) final String status,
            @RequestParam(required = false) final String date,
            @RequestParam(required = false, defaultValue = "desc") final String order,
            @RequestParam(required = false) final String keyword,
            @RequestParam(required = false) final Integer publisherId,
            @RequestParam(defaultValue = "1") final int page,
            @RequestParam(defaultValue = "10") final int size
    ) {
        final Page<Item> result = itemService.getItems(type, status, date, order, keyword, publisherId, page, size);
        return ApiResponse.success("查询成功", result);
    }

    /**
     * 创建物品（发布失物/拾物信息）
     */
    @PostMapping("")
    public ResponseEntity<ApiResponse<Item>> createItem(@RequestBody final ItemDto itemDto) {
        try {
            final Item item = itemService.createItem(itemDto);
            return ResponseEntity.ok(ApiResponse.success("发布成功，等待审核", item));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 更新物品信息（用户修改自己发布的物品信息）
     * 修改后物品状态将变为待审核，需要管理员重新审核
     * 
     * @param itemId 物品ID
     * @param itemDto 物品信息
     * @return 更新后的物品
     */
    @PutMapping("/{itemId}")
    public ResponseEntity<ApiResponse<Item>> updateItem(
            @PathVariable final Integer itemId,
            @RequestBody final ItemDto itemDto
    ) {
        try {
            final Item item = itemService.updateItem(itemId, itemDto);
            return ResponseEntity.ok(ApiResponse.success("修改成功，等待重新审核", item));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 删除物品信息（测试阶段简化版）
     * 
     * @param itemId 物品ID
     * @return 删除结果
     */
    @DeleteMapping("/{itemId}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(
            @PathVariable final Integer itemId
    ) {
        try {
            itemService.deleteItem(itemId);
            return ResponseEntity.ok(ApiResponse.success("物品删除成功"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    /**
     * 更新物品状态（管理员使用）
     * 
     * @param itemId 物品ID
     * @param requestBody 请求体，包含status(状态)和rejectionReason(驳回原因，当状态为"未通过"时必填)
     * @return 更新后的物品信息
     */
    @PutMapping("/{itemId}/status")
    public ApiResponse<Map<String, Object>> updateItemStatus(
            @PathVariable final Integer itemId,
            @RequestBody final Map<String, String> requestBody
    ) {
        final String status = requestBody.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ApiResponse.error("状态不能为空");
        }
        
        try {
            final Item.ItemStatus itemStatus = Item.ItemStatus.valueOf(status);
            
            // 如果状态是"未通过"，则需要驳回原因
            String rejectionReason = null;
            if (itemStatus == Item.ItemStatus.未通过) {
                rejectionReason = requestBody.get("rejectionReason");
                if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
                    return ApiResponse.error("驳回原因不能为空");
                }
            }
            
            final Item item = itemService.updateItemStatus(itemId, itemStatus, rejectionReason);
            if (item == null) {
                return ApiResponse.error("物品不存在或已处理");
            }
            
            final Map<String, Object> data = new HashMap<>();
            data.put("id", item.getId());
            data.put("title", item.getTitle());
            data.put("status", item.getStatus());
            if (rejectionReason != null) {
                data.put("rejectionReason", item.getRejectionReason());
            }
            
            return ApiResponse.success("状态更新成功", data);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error("无效的状态值");
        }
    }
    

    
    /**
     * 获取物品详情
     */
    @GetMapping("/{itemId}")
    public ApiResponse<Item> getItemDetail(@PathVariable final Integer itemId) {
        final Item item = itemService.getItemById(itemId);
        if (item == null) {
            return ApiResponse.error("物品不存在");
        }
        return ApiResponse.success("获取物品详情成功", item);
    }
    
    /**
     * 上传物品图片
     * 
     * @param itemId 物品ID
     * @param file 图片文件
     * @return 上传结果
     */
    @PostMapping("/{itemId}/photos")
    public ApiResponse<String> uploadItemImage(
            @PathVariable final Integer itemId,
            @RequestParam("file") final MultipartFile file) {
        
        // 检查文件是否为空
        if (file == null || file.isEmpty()) {
            return ApiResponse.error("请选择要上传的图片文件");
        }
        
        // 检查文件类型
        final String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ApiResponse.error("只能上传图片文件");
        }
        
        // 检查文件大小
        if (file.getSize() > 5 * 1024 * 1024) { // 5MB
            return ApiResponse.error("文件大小不能超过5MB");
        }
        
        try {
            logger.info("开始上传物品图片，物品ID: {}", itemId);
            logger.info("文件名: {}", file.getOriginalFilename());
            logger.info("文件类型: {}", file.getContentType());
            logger.info("文件大小: {} bytes", file.getSize());
            
            final Photo photo = itemService.uploadItemImage(itemId, file);
            logger.info("物品图片上传成功，URL: {}", photo.getUrl());
            return ApiResponse.success("上传成功", photo.getUrl());
        } catch (Exception e) {
            logger.error("物品图片上传失败: {}", e.getMessage(), e);
            return ApiResponse.error("图片上传失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取物品的所有图片
     * 
     * @param itemId 物品ID
     * @return 图片列表
     */
    @GetMapping("/{itemId}/photos")
    public ApiResponse<List<Photo>> getItemImages(@PathVariable final Integer itemId) {
        try {
            final List<Photo> photos = itemService.getItemImages(itemId);
            return ApiResponse.success("获取图片列表成功", photos);
        } catch (Exception e) {
            return ApiResponse.error("获取图片列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除物品图片
     * 
     * @param itemId 物品ID（用于URL路径一致性，实际不使用）
     * @param photoId 图片ID
     * @return 删除结果
     */
    @DeleteMapping("/{itemId}/photos/{photoId}")
    public ApiResponse<Void> deleteItemImage(
            @PathVariable final Integer itemId,
            @PathVariable final Integer photoId) {
        
        try {
            itemService.deleteItemImage(photoId);
            return ApiResponse.success("图片删除成功");
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("图片删除失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除物品的所有图片
     * 
     * @param itemId 物品ID
     * @return 删除结果
     */
    @DeleteMapping("/{itemId}/photos")
    public ApiResponse<Void> deleteAllItemImages(@PathVariable final Integer itemId) {
        try {
            itemService.deleteAllItemImages(itemId);
            return ApiResponse.success("所有图片删除成功");
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("图片删除失败: " + e.getMessage());
        }
    }
} 