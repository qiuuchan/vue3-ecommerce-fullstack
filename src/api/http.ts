// 这是一个最简单的请求工具，统一处理接口请求失败提示。
export const getJson = async <T>(url: string): Promise<T> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`请求失败，状态码：${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    // 用最直白的报错，方便排查。
    console.error('接口请求失败：', error);
    throw new Error('网络好像有点问题，请稍后重试');
  }
};
