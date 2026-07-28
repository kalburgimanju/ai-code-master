import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
});

export async function get<T>(url: string): Promise<T> {
  const { data } = await api.get<T>(url);
  return data;
}

export async function post<T>(url: string, body?: any): Promise<T> {
  const { data } = await api.post<T>(url, body);
  return data;
}
