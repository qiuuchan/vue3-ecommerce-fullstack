import { computed } from 'vue';
import { defineStore } from 'pinia';
import { useUserStore } from './userStore';

export const useAdminPermissionStore = defineStore('admin-permission', () => {
  const userStore = useUserStore();

  const allPermissions = computed(() => userStore.permissionCodes);

  const hasPermission = (permissionCode: string): boolean => {
    if (userStore.isAdmin) {
      return true;
    }
    return allPermissions.value.includes(permissionCode);
  };

  const hasAnyPermission = (codes: string[]): boolean => {
    if (userStore.isAdmin) {
      return true;
    }
    return codes.some((item) => allPermissions.value.includes(item));
  };

  return {
    allPermissions,
    hasPermission,
    hasAnyPermission
  };
});
