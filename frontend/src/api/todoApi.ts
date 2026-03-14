import axios from 'axios';
import type { Todo, TodoCreate, TodoUpdate, TodoListResponse, ApiEnvelope } from '../types/todo';

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api/v1',
});

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (envelope.error !== null) {
    throw new ApiError(envelope.error.code, envelope.error.message);
  }
  if (envelope.data === null) {
    throw new ApiError('NO_DATA', 'Response contained no data');
  }
  return envelope.data;
}

export interface GetTodosParams {
  page?: number;
  page_size?: number;
  completed?: boolean | null;
  priority?: string | null;
  search?: string;
}

export async function getTodos(params?: GetTodosParams): Promise<TodoListResponse> {
  const response = await apiClient.get<ApiEnvelope<TodoListResponse>>('/todos', { params });
  return unwrap(response.data);
}

export async function getTodoById(id: string): Promise<Todo> {
  const response = await apiClient.get<ApiEnvelope<Todo>>(`/todos/${id}`);
  return unwrap(response.data);
}

export async function createTodo(data: TodoCreate): Promise<Todo> {
  const response = await apiClient.post<ApiEnvelope<Todo>>('/todos', data);
  return unwrap(response.data);
}

export async function updateTodo(id: string, data: TodoUpdate): Promise<Todo> {
  const response = await apiClient.put<ApiEnvelope<Todo>>(`/todos/${id}`, data);
  return unwrap(response.data);
}

export async function deleteTodo(id: string): Promise<void> {
  await apiClient.delete(`/todos/${id}`);
}
