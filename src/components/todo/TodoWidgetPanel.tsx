import React, { useState, useEffect } from 'react';
import { FiCheckSquare, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { useTodosStore } from '../../store/todosStore';

export const TodoWidgetPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [newText, setNewText] = useState('');
  const { todos, loadTodos, addTodo, toggleTodo, removeTodo, clearCompleted } = useTodosStore();

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;
    addTodo(newText.trim());
    setNewText('');
  };

  const activeCount = todos.filter((t) => !t.completed).length;

  return (
    <div className="relative z-30">
      {/* Floating Launcher Button (Top-Left) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-button flex items-center gap-2 px-3 py-2 text-slate-800 dark:text-slate-100 font-medium text-sm rounded-xl shadow-md hover:shadow-lg transition-all"
        title="Todo List"
      >
        <FiCheckSquare className="w-4 h-4 text-blue-500" />
        <span>Tasks</span>
        {activeCount > 0 && (
          <span className="bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {activeCount}
          </span>
        )}
      </button>

      {/* Floating Glass Panel */}
      {isOpen && (
        <div className="absolute top-12 left-0 w-80 glass-panel p-4 shadow-2xl animate-scale-in border border-white/20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/40 dark:border-slate-700/40 mb-3">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-lg">
              <FiCheckSquare className="text-blue-500" /> Quick Tasks
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Add Todo Input */}
          <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-3 py-1.5 text-sm bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
            <button
              type="submit"
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow transition-colors"
            >
              <FiPlus className="w-4 h-4" />
            </button>
          </form>

          {/* Todo List */}
          <div className="max-h-60 overflow-y-auto scrollbar-thin space-y-1.5 pr-1">
            {todos.length === 0 ? (
              <p className="text-xs text-center text-slate-400 py-4">No tasks added yet.</p>
            ) : (
              todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors group"
                >
                  <label className="flex items-center gap-2.5 flex-1 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500 border-slate-300"
                    />
                    <span
                      className={`text-sm ${
                        todo.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {todo.text}
                    </span>
                  </label>
                  <button
                    onClick={() => removeTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-600 rounded transition-opacity"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {todos.some((t) => t.completed) && (
            <div className="pt-2 border-t border-slate-200/40 dark:border-slate-700/40 mt-3 text-right">
              <button
                onClick={clearCompleted}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                Clear completed
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
