import { ElMessage } from 'element-plus';

export function toastSuccess(message: string): void {
  ElMessage.success({ message, plain: true });
}

export function toastError(message: string): void {
  ElMessage.error({ message, plain: true });
}

export function toastWarning(message: string): void {
  ElMessage.warning({ message, plain: true });
}

export function toastInfo(message: string): void {
  ElMessage.info({ message, plain: true });
}
