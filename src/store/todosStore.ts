import { create } from 'zustand';
import type { Todo } from '../types/todo';
import { todoStorage } from '../services/todoStorage';

interface TodosState {
  todos: Todo[];
  loadTodos: () => void;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  removeTodo: (id: string) => void;
  clearCompleted: () => void;
}

export const useTodosStore = create<TodosState>((set) => ({
  todos: [],

  loadTodos: () => {
    set({ todos: todoStorage.getAll() });
  },

  addTodo: (text) => {
    todoStorage.add(text);
    set({ todos: todoStorage.getAll() });
  },

  toggleTodo: (id) => {
    todoStorage.toggle(id);
    set({ todos: todoStorage.getAll() });
  },

  removeTodo: (id) => {
    todoStorage.remove(id);
    set({ todos: todoStorage.getAll() });
  },

  clearCompleted: () => {
    todoStorage.clearCompleted();
    set({ todos: todoStorage.getAll() });
  },
}));

export default useTodosStore;
