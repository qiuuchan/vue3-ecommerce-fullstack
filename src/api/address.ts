import { getData, postData, putData, deleteData } from '@/api/request';
import type { Address, AddressPayload } from '@/types/order';

export const fetchAddresses = (): Promise<Address[]> => {
  return getData<Address[]>('/api/user/addresses');
};

export const createAddress = (payload: AddressPayload): Promise<Address> => {
  return postData<Address>('/api/user/addresses', payload);
};

export const updateAddress = (id: number, payload: AddressPayload): Promise<Address> => {
  return putData<Address>(`/api/user/addresses/${id}`, payload);
};

export const deleteAddress = (id: number): Promise<void> => {
  return deleteData<void>(`/api/user/addresses/${id}`);
};

export const setDefaultAddress = (id: number): Promise<void> => {
  return putData<void>(`/api/user/addresses/${id}/default`);
};
