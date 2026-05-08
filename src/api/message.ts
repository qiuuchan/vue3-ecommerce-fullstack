import { getData, putData } from '@/api/request';

export interface MessageItem {
  id: number;
  title: string;
  content: string;
  type: 'order' | 'inventory' | 'system';
  isRead: boolean;
  createdAt: string;
}

export const fetchMessageList = (): Promise<MessageItem[]> => {
  return getData<MessageItem[]>('/admin/messages');
};

export const markMessageReadApi = (id: number): Promise<MessageItem> => {
  return putData<MessageItem>(`/admin/messages/${id}/read`);
};
