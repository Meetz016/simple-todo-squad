import { useState, useEffect } from "react";
import { Todo } from "./TodoItem";
import { TodoItem } from "./TodoItem";
import { AddTodo } from "./AddTodo";
import { TodoStats } from "./TodoStats";
import { TodoFilters, FilterType } from "./TodoFilters";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "todos";

export const TodoApp = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const { toast } = useToast();

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
        }));
        setTodos(parsedTodos);
      } catch (error) {
        console.error("Error loading todos:", error);
      }
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTodo = (text: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: new Date(),
    };
    setTodos((prev) => [newTodo, ...prev]);
    toast({
      title: "Todo added!",
      description: "Your new task has been added successfully.",
    });
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) => {
        if (todo.id === id) {
          const updatedTodo = { ...todo, completed: !todo.completed };
          toast({
            title: updatedTodo.completed ? "Task completed!" : "Task reactivated",
            description: updatedTodo.completed 
              ? "Great job! Keep up the momentum." 
              : "Task moved back to active.",
          });
          return updatedTodo;
        }
        return todo;
      })
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
    toast({
      title: "Todo deleted",
      description: "The task has been removed from your list.",
      variant: "destructive",
    });
  };

  const editTodo = (id: string, newText: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, text: newText } : todo
      )
    );
    toast({
      title: "Todo updated",
      description: "Your task has been successfully updated.",
    });
  };

  const clearCompleted = () => {
    const completedCount = todos.filter(todo => todo.completed).length;
    setTodos((prev) => prev.filter((todo) => !todo.completed));
    if (completedCount > 0) {
      toast({
        title: "Completed tasks cleared",
        description: `Removed ${completedCount} completed task${completedCount > 1 ? 's' : ''}.`,
      });
    }
  };

  const markAllComplete = () => {
    const activeCount = todos.filter(todo => !todo.completed).length;
    if (activeCount > 0) {
      setTodos((prev) => prev.map((todo) => ({ ...todo, completed: true })));
      toast({
        title: "All tasks completed!",
        description: `Marked ${activeCount} task${activeCount > 1 ? 's' : ''} as complete.`,
      });
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const stats = {
    total: todos.length,
    active: todos.filter(todo => !todo.completed).length,
    completed: todos.filter(todo => todo.completed).length,
  };

  return (
    <div className="min-h-screen bg-gradient-secondary p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Todo App
          </h1>
          <p className="text-muted-foreground">
            Stay organized and productive with your personal task manager
          </p>
        </div>

        <TodoStats todos={todos} />

        <div className="bg-gradient-card rounded-2xl shadow-card border border-border p-6 mb-6">
          <AddTodo onAdd={addTodo} />

          <TodoFilters
            activeFilter={filter}
            onFilterChange={setFilter}
            totalCount={stats.total}
            activeCount={stats.active}
            completedCount={stats.completed}
          />

          {todos.length > 0 && (
            <div className="flex justify-center gap-2 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={markAllComplete}
                disabled={stats.active === 0}
                className="border-todo-complete text-todo-complete hover:bg-todo-complete hover:text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCompleted}
                disabled={stats.completed === 0}
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Completed
              </Button>
            </div>
          )}

          <div className="space-y-3">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {filter === "all" ? "No todos yet" : 
                   filter === "active" ? "No active todos" : 
                   "No completed todos"}
                </h3>
                <p className="text-muted-foreground">
                  {filter === "all" ? "Add your first todo above to get started!" :
                   filter === "active" ? "All tasks are completed! Great job!" :
                   "Complete some tasks to see them here."}
                </p>
              </div>
            ) : (
              filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onEdit={editTodo}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};