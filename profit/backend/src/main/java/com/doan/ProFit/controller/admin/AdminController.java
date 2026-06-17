package com.doan.ProFit.controller.admin;

import com.doan.ProFit.dto.request.UserCreationRequest;
import com.doan.ProFit.dto.request.UserUpdateRequest;
import com.doan.ProFit.dto.response.UserResponse;
import com.doan.ProFit.dto.response.DashboardStatsResponse;
import com.doan.ProFit.exception.UserNotFoundException;
import com.doan.ProFit.service.UserService;
import com.doan.ProFit.service.CategoryService;
import com.doan.ProFit.service.ProductService;
import com.doan.ProFit.dto.request.CategoryRequest;
import com.doan.ProFit.dto.response.CategoryResponse;
import com.doan.ProFit.dto.request.ProductRequest;
import com.doan.ProFit.dto.response.ProductResponse;
import com.doan.ProFit.service.OrderService;
import com.doan.ProFit.dto.request.OrderStatusUpdateRequest;
import com.doan.ProFit.dto.response.OrderResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin
@Controller
@RequestMapping("/admin")
public class AdminController {
    @Autowired
    private UserService userService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private ProductService productService;

    @Autowired
    private OrderService orderService;

    @GetMapping("/index")
    public String adminIndex() {
        return "admin/index";
    }

    @GetMapping("/order/list")
    public String orderList() {
        return "admin/order/list";
    }

    @GetMapping("/order/detail")
    public String orderDetail(@RequestParam("id") String id) {
        return "admin/order/detail";
    }

    @GetMapping("/product/list")
    public String productList() {
        return "admin/product/list";
    }

    @GetMapping("/product/category")
    public String productCategory() {
        return "admin/product/category";
    }

    @GetMapping("/product/add")
    public String productAdd() {
        return "admin/product/add";
    }

    @GetMapping("/user/list")
    public String userList() {
        return "admin/user/list";
    }

    @GetMapping("/marketing/discount")
    public String marketingDiscount() {
        return "admin/marketing/discount";
    }

    @GetMapping("/reviews/review")
    public String reviews() {
        return "admin/reviews/review";
    }

    @GetMapping("/user/all")
    @ResponseBody
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping("/user/add")
    @ResponseBody
    public UserResponse createUser(@RequestBody UserCreationRequest request) {
        return userService.createUser(request);
    }

    @PutMapping("/user/{id}")
    @ResponseBody
    public UserResponse updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest request) {
        return userService.updateUser(id, request);
    }

    @DeleteMapping("/user/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    // Category APIs
    @GetMapping("/category/all")
    @ResponseBody
    public List<CategoryResponse> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @PostMapping("/category/add")
    @ResponseBody
    public CategoryResponse createCategory(@RequestBody CategoryRequest request) {
        return categoryService.createCategory(request);
    }

    @PutMapping("/category/{id}")
    @ResponseBody
    public CategoryResponse updateCategory(@PathVariable Long id, @RequestBody CategoryRequest request) {
        return categoryService.updateCategory(id, request);
    }

    @DeleteMapping("/category/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
    }

    // Product APIs
    @GetMapping("/product/all")
    @ResponseBody
    public List<ProductResponse> getAllProducts() {
        return productService.getAllProducts();
    }

    @PostMapping("/product/add")
    @ResponseBody
    public ProductResponse createProduct(@RequestBody ProductRequest request) {
        return productService.createProduct(request);
    }

    @PutMapping("/product/{id}")
    @ResponseBody
    public ProductResponse updateProduct(@PathVariable Long id, @RequestBody ProductRequest request) {
        return productService.updateProduct(id, request);
    }

    @DeleteMapping("/product/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
    }

    // Order APIs
    @GetMapping("/order/all")
    @ResponseBody
    public List<OrderResponse> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/order/{id}")
    @ResponseBody
    public OrderResponse getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    @PutMapping("/order/{id}/status")
    @ResponseBody
    public OrderResponse updateOrderStatus(@PathVariable Long id, @RequestBody OrderStatusUpdateRequest request) {
        return orderService.updateOrderStatus(id, request);
    }

    @PostMapping("/order/{id}/delivery-failed")
    @ResponseBody
    public OrderResponse markDeliveryFailed(@PathVariable Long id) {
        return orderService.markDeliveryFailed(id);
    }

    // Dashboard Statistics API
    @GetMapping("/dashboard/stats")
    @ResponseBody
    public DashboardStatsResponse getDashboardStats() {
        return orderService.getDashboardStats();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public String handleBadRequest(IllegalArgumentException ex) {
        return ex.getMessage();
    }

    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ResponseBody
    public String handleNotFound(UserNotFoundException ex) {
        return ex.getMessage();
    }

}
