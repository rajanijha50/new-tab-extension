import React, { useState, useRef, useEffect } from 'react';
import { MdCheck, MdClose, MdDeleteSweep } from 'react-icons/md';
import { useTodosStore } from '../store/todosStore';
import clsx from 'clsx';
import { LuListTodo } from 'react-icons/lu';

export const TodoWidget: React.FC = () => {
  const { todos, loadTodos, addTodo, toggleTodo, removeTodo, clearCompleted } = useTodosStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const handleAdd = () => {
    if (inputValue.trim()) {
      addTodo(inputValue.trim());
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAdd();
  };

  const activeTodos = todos.filter((t) => !t.completed);
  const completedCount = todos.length - activeTodos.length;

  return (
    <div ref={panelRef} className="relative shrink-0">
      {/* Collapsed button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl glass hover:bg-white/25 dark:hover:bg-white/10 text-current transition-all duration-200 cursor-pointer active:scale-95"
        title="Open todos"
      >
        <LuListTodo className="text-lg text-accent-secondary" />
        
      </button>

      {/* Expanded panel - absolute overlay */}
      {isExpanded && (
        <div className="absolute top-full left-0 mt-2 glass rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/30 border border-white/20 dark:border-white/8 animate-scale-in overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 dark:border-white/8">
            <div className="flex items-center gap-2">
              <LuListTodo className="text-lg text-accent-secondary" />
              <span className="text-sm font-bold tracking-wide">My Todos</span>
              {activeTodos.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent-primary/20 text-accent-primary">
                  {activeTodos.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg hover:bg-white/15 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
              aria-label="Close todos"
            >
              <MdClose className="text-base" />
            </button>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="px-3 pt-3 pb-2">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Add a new todo..."
                className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/15 dark:bg-white/5 border border-white/10 dark:border-white/8 text-current placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-primary/50 transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="px-3 py-2 rounded-lg bg-accent-primary hover:bg-accent-primary/85 text-white text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              >
                Add
              </button>
            </div>
          </form>

          {/* Todo list */}
          <div className="max-h-56 overflow-y-auto px-3 pb-2 scrollbar-thin">
            {todos.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400 dark:text-gray-500 italic">
                No todos yet. Add one above!
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {[...activeTodos, ...todos.filter((t) => t.completed)].map((todo, i) => (
                  <div
                    key={todo.id}
                    className={clsx(
                      'flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all duration-200 group',
                      todo.completed
                        ? 'opacity-50'
                        : 'hover:bg-white/10 dark:hover:bg-white/5',
                      i < activeTodos.length && 'animate-slide-in-left'
                    )}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={clsx(
                        'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0',
                        todo.completed
                          ? 'bg-accent-secondary border-accent-secondary text-white'
                          : 'border-gray-300 dark:border-gray-600 hover:border-accent-primary'
                      )}
                      aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    >
                      {todo.completed && <MdCheck className="text-xs" />}
                    </button>
                    <span
                      className={clsx(
                        'flex-1 text-sm truncate transition-all duration-200',
                        todo.completed
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : 'text-gray-700 dark:text-gray-200'
                      )}
                    >
                      {todo.text}
                    </span>
                    <button
                      onClick={() => removeTodo(todo.id)}
                      className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-accent-danger/20 text-gray-400 hover:text-accent-danger transition-all duration-200 cursor-pointer"
                      aria-label="Delete todo"
                    >
                      <MdClose className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {completedCount > 0 && (
            <div className="px-3 pb-3 pt-1 border-t border-white/10 dark:border-white/8">
              <button
                onClick={clearCompleted}
                className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 hover:text-accent-danger dark:text-gray-500 dark:hover:text-accent-danger transition-colors cursor-pointer"
              >
                <MdDeleteSweep className="text-sm" />
                Clear {completedCount} completed
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TodoWidget;
