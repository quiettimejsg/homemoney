import { defineStore } from 'pinia';

export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: []
  }),

  getters: {
    completedTodos: (state) => state.todos.filter(todo => todo.completed),
    pendingTodos: (state) => state.todos.filter(todo => !todo.completed),
    totalTodos: (state) => state.todos.length,
    completedCount: (state) => state.todos.filter(todo => todo.completed).length
  },

  actions: {
    // 添加新的待办事项
    addTodo (text) {
      if (!text.trim()) return;

      const newTodo = {
        id: Date.now().toString(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      };

      this.todos.unshift(newTodo);
      this.saveTodos();
    },

    // 切换待办事项完成状态
    toggleTodo (id) {
      const todo = this.todos.find(t => t.id === id);
      if (todo) {
        todo.completed = !todo.completed;
        todo.updatedAt = new Date().toISOString();
        this.saveTodos();
      }
    },

    // 删除待办事项
    deleteTodo (id) {
      const index = this.todos.findIndex(t => t.id === id);
      if (index > -1) {
        this.todos.splice(index, 1);
        this.saveTodos();
      }
    },

    // 编辑待办事项文本
    editTodo (id, newText) {
      const todo = this.todos.find(t => t.id === id);
      if (todo && newText.trim()) {
        todo.text = newText.trim();
        todo.updatedAt = new Date().toISOString();
        this.saveTodos();
      }
    },

    // 清除所有已完成的待办事项
    clearCompleted () {
      this.todos = this.todos.filter(todo => !todo.completed);
      this.saveTodos();
    },

    // 保存到本地存储
    async saveTodos () {
      try {
        // 保存到本地存储
        localStorage.setItem('homemoney-todos', JSON.stringify(this.todos));

        // 保存到服务器
        const response = await fetch('/api/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.todos)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Todos saved to server successfully');
      } catch (error) {
        console.error('Failed to save todos:', error);
      }
    },

    // 从本地存储加载
    async loadTodos () {
      try {
        // 尝试从服务器获取数据
        const response = await fetch('/api/todos');
        if (response.ok) {
          const serverTodos = await response.json();
          // 修正completed字段类型
          this.todos = (Array.isArray(serverTodos) ? serverTodos : []).map(todo => ({
            ...todo,
            completed: todo.completed === true || todo.completed === 'true'
          }));
          // 更新本地存储
          localStorage.setItem('homemoney-todos', JSON.stringify(this.todos));
        } else {
          // 服务器获取失败，从本地存储加载
          const saved = localStorage.getItem('homemoney-todos');
          if (saved) {
            const localTodos = JSON.parse(saved);
            this.todos = (Array.isArray(localTodos) ? localTodos : []).map(todo => ({
              ...todo,
              completed: todo.completed === true || todo.completed === 'true'
            }));
          }
        }
      } catch (error) {
        // 网络错误，从本地存储加载
        console.error('Failed to fetch todos from server:', error);
        const saved = localStorage.getItem('homemoney-todos');
        if (saved) {
          const localTodos = JSON.parse(saved);
          this.todos = (Array.isArray(localTodos) ? localTodos : []).map(todo => ({
            ...todo,
            completed: todo.completed === true || todo.completed === 'true'
          }));
        }
      }
    }
  }
});
