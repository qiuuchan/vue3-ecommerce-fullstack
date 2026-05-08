/**
 * Token 内存存储：与 localStorage 解耦，避免循环依赖。
 * accessToken 仅存在内存，页面刷新后通过 refreshToken 恢复。
 */
let accessToken = '';

export const setAccessToken = (token: string): void => {
  accessToken = token;
};

export const getAccessToken = (): string => accessToken;

export const clearAccessToken = (): void => {
  accessToken = '';
};
