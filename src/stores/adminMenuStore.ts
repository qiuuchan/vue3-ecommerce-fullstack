import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { useUserStore } from './userStore';

export interface AdminMenuItem {
  key: string;
  /** i18n key，与 messages 中 menu.* 一致 */
  titleKey: string;
  path?: string;
  children?: AdminMenuItem[];
  permissionCode?: string;
}

const adminMenus: AdminMenuItem[] = [
  {
    key: 'dashboard',
    titleKey: 'menu.dashboard',
    path: '/admin/dashboard'
  },
  {
    key: 'product',
    titleKey: 'menu.product',
    children: [
      {
        key: 'product-list',
        titleKey: 'menu.productList',
        path: '/admin/product/list',
        permissionCode: 'product:view'
      },
      {
        key: 'product-create',
        titleKey: 'menu.productCreate',
        path: '/admin/product/create',
        permissionCode: 'product:create'
      }
    ]
  },
  {
    key: 'category',
    titleKey: 'menu.category',
    path: '/admin/category/list',
    permissionCode: 'category:view'
  },
  {
    key: 'shop',
    titleKey: 'menu.shop',
    path: '/admin/shop/list',
    permissionCode: 'shop:view'
  },
  {
    key: 'inventory',
    titleKey: 'menu.inventory',
    children: [
      {
        key: 'inventory-list',
        titleKey: 'menu.inventoryList',
        path: '/admin/inventory/list',
        permissionCode: 'inventory:view'
      },
      {
        key: 'inventory-warning',
        titleKey: 'menu.inventoryWarning',
        path: '/admin/inventory/warning',
        permissionCode: 'inventory:warning'
      }
    ]
  },
  {
    key: 'order',
    titleKey: 'menu.order',
    children: [
      {
        key: 'order-list',
        titleKey: 'menu.orderList',
        path: '/admin/order/list',
        permissionCode: 'order:view'
      }
    ]
  },
  {
    key: 'permission',
    titleKey: 'menu.permission',
    children: [
      {
        key: 'user-list',
        titleKey: 'menu.userList',
        path: '/admin/user/list',
        permissionCode: 'user:view'
      },
      {
        key: 'role-list',
        titleKey: 'menu.roleList',
        path: '/admin/role/list',
        permissionCode: 'role:view'
      }
    ]
  },
  {
    key: 'message',
    titleKey: 'menu.message',
    path: '/admin/message/list',
    permissionCode: 'message:view'
  },
  {
    key: 'profile',
    titleKey: 'menu.profile',
    path: '/admin/profile',
    permissionCode: 'profile:view'
  }
];

const filterMenusByPermissions = (menus: AdminMenuItem[], permissions: string[]): AdminMenuItem[] => {
  return menus
    .map((item) => {
      const filteredChildren = item.children?.length
        ? filterMenusByPermissions(item.children, permissions)
        : undefined;

      if (item.children && item.children.length > 0) {
        if (!filteredChildren || filteredChildren.length === 0) return null;
        return { ...item, children: filteredChildren };
      }

      const canShowSelf = !item.permissionCode || permissions.includes(item.permissionCode);
      return canShowSelf ? { ...item } : null;
    })
    .filter((item): item is AdminMenuItem => item !== null);
};

export const useAdminMenuStore = defineStore('admin-menu', () => {
  const collapsed = ref(false);
  const userStore = useUserStore();

  const menus = computed(() => {
    if (userStore.permissionCodes.length === 0) {
      return adminMenus;
    }
    return filterMenusByPermissions(adminMenus, userStore.permissionCodes);
  });

  const toggleCollapsed = (): void => {
    collapsed.value = !collapsed.value;
  };

  return {
    collapsed,
    menus,
    toggleCollapsed
  };
});
