import { API_BASE_URL, getDefaultHeaders } from './apiConfig';

const ADMIN_API_URL = `${API_BASE_URL}/admin`;

export const adminService = {
    /**
     * Lấy danh sách tất cả người dùng
     * GET /admin/user/all
     */
    getAllUsers: async () => {
        try {
            const response = await fetch(`${ADMIN_API_URL}/user/all`, {
                method: 'GET',
                headers: getDefaultHeaders(),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to fetch users');
            }
            return await response.json();
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            throw error;
        }
    },

    /**
     * Thêm mới người dùng
     * POST /admin/user/add
     */
    createUser: async (userData) => {
        try {
            const response = await fetch(`${ADMIN_API_URL}/user/add`, {
                method: 'POST',
                headers: getDefaultHeaders(),
                body: JSON.stringify(userData),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to create user');
            }
            return await response.json(); // Trả về UserResponse
        } catch (error) {
            console.error('Error in createUser:', error);
            throw error;
        }
    },

    /**
     * Cập nhật thông tin người dùng
     * PUT /admin/user/{id}
     */
    updateUser: async (id, userData) => {
        try {
            const response = await fetch(`${ADMIN_API_URL}/user/${id}`, {
                method: 'PUT',
                headers: getDefaultHeaders(),
                body: JSON.stringify(userData),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to update user');
            }
            return await response.json(); // Trả về UserResponse
        } catch (error) {
            console.error('Error in updateUser:', error);
            throw error;
        }
    },

    deleteUser: async (id) => {
        try {
            const response = await fetch(`${ADMIN_API_URL}/user/${id}`, {
                method: 'DELETE',
                headers: getDefaultHeaders(),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to delete user');
            }
            return true;
        } catch (error) {
            console.error('Error in deleteUser:', error);
            throw error;
        }
    },

    // ==========================================
    // CATEGORY APIs
    // ==========================================
    getAllCategories: async () => {
        const res = await fetch(`${ADMIN_API_URL}/category/all`, { headers: getDefaultHeaders() });
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
    },
    createCategory: async (data) => {
        const res = await fetch(`${ADMIN_API_URL}/category/add`, {
            method: 'POST',
            headers: getDefaultHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create category');
        return res.json();
    },
    updateCategory: async (id, data) => {
        const res = await fetch(`${ADMIN_API_URL}/category/${id}`, {
            method: 'PUT',
            headers: getDefaultHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update category');
        return res.json();
    },
    deleteCategory: async (id) => {
        const res = await fetch(`${ADMIN_API_URL}/category/${id}`, {
            method: 'DELETE',
            headers: getDefaultHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete category');
        return true;
    },

    // ==========================================
    // PRODUCT APIs
    // ==========================================
    getAllProducts: async () => {
        const res = await fetch(`${ADMIN_API_URL}/product/all`, { headers: getDefaultHeaders() });
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
    },
    createProduct: async (data) => {
        const res = await fetch(`${ADMIN_API_URL}/product/add`, {
            method: 'POST',
            headers: getDefaultHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to create product');
        return res.json();
    },
    updateProduct: async (id, data) => {
        const res = await fetch(`${ADMIN_API_URL}/product/${id}`, {
            method: 'PUT',
            headers: getDefaultHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update product');
        return res.json();
    },
    deleteProduct: async (id) => {
        const res = await fetch(`${ADMIN_API_URL}/product/${id}`, {
            method: 'DELETE',
            headers: getDefaultHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete product');
        return true;
    },

    // ==========================================
    // ORDER APIs
    // ==========================================
    getAllOrders: async () => {
        const res = await fetch(`${ADMIN_API_URL}/order/all`, { headers: getDefaultHeaders() });
        if (!res.ok) throw new Error('Failed to fetch orders');
        return res.json();
    },
    getOrderById: async (id) => {
        const res = await fetch(`${ADMIN_API_URL}/order/${id}`, { headers: getDefaultHeaders() });
        if (!res.ok) throw new Error('Failed to fetch order');
        return res.json();
    },
    updateOrderStatus: async (id, data) => {
        const res = await fetch(`${ADMIN_API_URL}/order/${id}/status`, {
            method: 'PUT',
            headers: getDefaultHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update order status');
        return res.json();
    },
    markDeliveryFailed: async (id) => {
        const res = await fetch(`${ADMIN_API_URL}/order/${id}/delivery-failed`, {
            method: 'POST',
            headers: getDefaultHeaders(),
        });
        if (!res.ok) {
            const err = await res.text().catch(() => 'Failed to mark delivery failed');
            throw new Error(err);
        }
        return res.json();
    },

    // ==========================================
    // DASHBOARD STATS API
    // ==========================================
    getDashboardStats: async () => {
        const res = await fetch(`${ADMIN_API_URL}/dashboard/stats`, { headers: getDefaultHeaders() });
        if (!res.ok) throw new Error('Failed to fetch dashboard stats');
        return res.json();
    },

    // ==========================================
    // NOTIFICATION APIs
    // ==========================================
    /**
     * Lấy tất cả thông báo chưa đọc cho admin
     * Bao gồm: tin nhắn liên hệ + đơn hàng chờ xác nhận
     */
    getAllNotifications: async () => {
        const res = await fetch(`${ADMIN_API_URL}/notifications`, {
            headers: getDefaultHeaders()
        });
        if (!res.ok) throw new Error('Failed to get notifications');
        return res.json();
    },
};
