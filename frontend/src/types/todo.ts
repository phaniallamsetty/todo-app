export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: Priority;
  created_at: string;
  updated_at: string | null;
}

export interface TodoCreate {
  title: string;
  description?: string | null;
  priority?: Priority;
}

export interface TodoUpdate {
  title?: string;
  description?: string | null;
  completed?: boolean;
  priority?: Priority;
}

export interface TodoListResponse {
  items: Todo[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiMeta {
  version: string;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
}

export interface ApiEnvelope<T> {
  data: T | null;
  meta: ApiMeta;
  error: ApiErrorDetail | null;
}

export interface TodoFilters {
  search?: string;
  status?: 'all' | 'active' | 'completed';
  priority?: 'all' | Priority;
}
