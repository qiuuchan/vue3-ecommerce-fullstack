import { defineStore } from 'pinia'; // 引入 defineStore：作用是创建全局购物车仓库
import { computed, ref } from 'vue'; // 引入 ref / computed：列表用 ref，总价用 computed
import { addCartItem, fetchCartList } from '@/api/cart'; // 引入接口方法：加购、拉购物车都走后端
import { toastError } from '@/utils/toast';

// 购物车每一行：和后端返回字段对齐（id 是购物车行 id，不是商品 id）
export interface CartLine {
  id: number; // 购物车行 id：后端用来区分每一条记录
  productId: number; // 商品 id：对应商品
  name: string; // 商品名称：页面展示用
  price: number; // 单价：算总价用
  count: number; // 数量：页面展示用
}

// 加购入参：页面/组件传商品信息过来（实际请求只用 id 当 productId）
interface AddGoodsPayload {
  id: number;
  name: string;
  price: number;
}

export const useCartStore = defineStore('cart', () => {
  // 购物车列表：数据以服务端为准，这里用接口拉下来的结果覆盖
  const cartList = ref<CartLine[]>([]);

  // 从后端刷新购物车列表；silent=true 时失败不弹窗（比如顶栏静默刷新）
  const loadCart = async (options?: { silent?: boolean }): Promise<void> => {
    try {
      const list = await fetchCartList(); // GET /api/cart：带上 token 才能成功
      cartList.value = list; // 用后端数据覆盖本地
    } catch (error) {
      cartList.value = []; // 失败就先清空展示，避免显示过期数据
      const msg = error instanceof Error ? error.message : '加载购物车失败';
      console.error(msg); // 控制台留一条，方便排查
      if (!options?.silent) {
        toastError(msg); // 非静默模式：给用户一个失败提示
      } // 结束是否弹窗判断
    } // 结束 try/catch
  }; // 结束 loadCart

  // 加购：先 POST 加购，再 GET 拉最新列表（两步都成功才算真的成功）
  const addGoods = async (goods: AddGoodsPayload): Promise<boolean> => {
    try {
      await addCartItem({ productId: goods.id, count: 1 }); // 后端按商品 id 加 1 件
      cartList.value = await fetchCartList(); // 立刻同步服务端数据，顶栏数量也会跟着对
      return true; // 告诉按钮：可以加“成功”提示
    } catch (error) {
      const msg = error instanceof Error ? error.message : '加购失败，请确认已登录且后端已启动';
      console.error(msg);
      toastError(msg); // 最常见：401 未登录 或 网络不通
      return false; // 告诉调用方：没加成
    } // 结束 try/catch
  }; // 结束 addGoods

  // 清空本地购物车展示：退出登录时会用到
  const clearCart = (): void => {
    cartList.value = []; // 直接变空数组
  }; // 结束 clearCart

  // 总价：把每一行的 单价×数量 加起来
  const totalPrice = computed(() => {
    return cartList.value.reduce((sum, item) => sum + item.price * item.count, 0);
  });

  return {
    cartList,
    totalPrice,
    loadCart,
    addGoods,
    clearCart
  };
});
