import type { Todo } from '../types/todo';

const STORAGE_KEY = 'todos';

class TodoStorage {
  getAll(): Todo[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    try {
      return JSON.parse(data) as Todo[];
    } catch {
      return [];
    }
  }

  save(todos: Todo[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  add(text: string): Todo {
    const todos = this.getAll();
    const newTodo: Todo = {
      id: Math.random().toString(36).substring(2, 11),
      text: text.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    todos.push(newTodo);
    this.save(todos);
    return newTodo;
  }

  toggle(id: string): void {
    const todos = this.getAll();
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.save(todos);
    }
  }

  remove(id: string): void {
    const todos = this.getAll().filter((t) => t.id !== id);
    this.save(todos);
  }

  clearCompleted(): void {
    const todos = this.getAll().filter((t) => !t.completed);
    this.save(todos);
  }
}

export const todoStorage = new TodoStorage();
export default todoStorage;
