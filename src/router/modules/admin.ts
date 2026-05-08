import type { RouteRecordRaw } from 'vue-router';

export const adminRoutes: RouteRecordRaw = {
  path: '/admin',
  component: () => import('@/layouts/AdminLayout.vue'),
  meta: {
    requiresAuth: true,
    requiresAdmin: true,
    title: '后台首页',
    titleKey: 'route.adminHome'
  },
  redirect: '/admin/dashboard',
  children: [
    {
      path: 'dashboard',
      name: 'admin-dashboard',
      component: () => import('@/views/admin/dashboard/DashboardView.vue'),
      meta: { title: '仪表盘', titleKey: 'route.dashboard', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: 'product/list',
      name: 'admin-product-list',
      component: () => import('@/views/admin/product/ProductListAdminView.vue'),
      meta: { title: '商品列表', titleKey: 'route.productList', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: 'product/create',
      name: 'admin-product-create',
      component: () => import('@/views/admin/product/ProductFormAdminView.vue'),
      meta: { title: '新增商品', titleKey: 'route.productCreate', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: 'product/edit/:id',
      name: 'admin-product-edit',
      component: () => import('@/views/admin/product/ProductFormAdminView.vue'),
      meta: { title: '编辑商品', titleKey: 'route.productEdit', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: 'product/detail/:id',
      name: 'admin-product-detail',
      component: () => import('@/views/admin/product/ProductDetailAdminView.vue'),
      meta: { title: '商品详情', titleKey: 'route.productDetail', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: 'category/list',
      name: 'admin-category-list',
      component: () => import('@/views/admin/category/CategoryListAdminView.vue'),
      meta: { title: '分类管理', titleKey: 'route.categoryList', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: 'shop/list',
      name: 'admin-shop-list',
      component: () => import('@/views/admin/shop/ShopListAdminView.vue'),
      meta: { title: '店铺管理', titleKey: 'route.shopList', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: 'inventory/list',
      name: 'admin-inventory-list',
      component: () => import('@/views/admin/inventory/InventoryListAdminView.vue'),
      meta: { title: '库存列表', titleKey: 'route.inventoryList', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: 'inventory/warning',
      name: 'admin-inventory-warning',
      component: () => import('@/views/admin/inventory/InventoryWarningAdminView.vue'),
      meta: { title: '库存预警', titleKey: 'route.inventoryWarning', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: 'order/list',
      name: 'admin-order-list',
      component: () => import('@/views/admin/order/OrderListAdminView.vue'),
      meta: { title: '订单列表', titleKey: 'route.orderList', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: 'order/detail/:id',
      name: 'admin-order-detail',
      component: () => import('@/views/admin/order/OrderDetailAdminView.vue'),
      meta: { title: '订单详情', titleKey: 'route.orderDetail', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: 'user/list',
      name: 'admin-user-list',
      component: () => import('@/views/admin/system/UserListAdminView.vue'),
      meta: { title: '用户管理', titleKey: 'route.userList', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: 'role/list',
      name: 'admin-role-list',
      component: () => import('@/views/admin/system/RoleListAdminView.vue'),
      meta: { title: '角色管理', titleKey: 'route.roleList', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: 'message/list',
      name: 'admin-message-list',
      component: () => import('@/views/admin/system/MessageListAdminView.vue'),
      meta: { title: '消息中心', titleKey: 'route.messageList', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: 'profile',
      name: 'admin-profile',
      component: () => import('@/views/admin/system/ProfileAdminView.vue'),
      meta: { title: '个人中心', titleKey: 'route.profile', requiresAuth: true, requiresAdmin: true }
    }
  ]
};
