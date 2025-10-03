import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Todo } from "./TodoItem";
import { TodoItem } from "./TodoItem";
import { AddTodo } from "./AddTodo";
import { TodoStats } from "./TodoStats";
import { TodoFilters, FilterType } from "./TodoFilters";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
export const TodoApp = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication and load todos
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Load todos from database
  useEffect(() => {
    if (session?.user) {
      fetchTodos();
    }
  }, [session]);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching todos:", error);
      toast({
        title: "Error",
        description: "Failed to load todos",
        variant: "destructive",
      });
    } else {
      setTodos(data.map(todo => ({
        id: todo.id,
        text: todo.text,
        completed: todo.completed,
        createdAt: new Date(todo.created_at)
      })));
    }
  };
  const addTodo = async (text: string) => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("todos")
      .insert([{ text, user_id: session.user.id }])
      .select()
      .single();

    if (error) {
      console.error("Error adding todo:", error);
      toast({
        title: "Error",
        description: "Failed to add todo",
        variant: "destructive",
      });
    } else {
      setTodos(prev => [{
        id: data.id,
        text: data.text,
        completed: data.completed,
        createdAt: new Date(data.created_at)
      }, ...prev]);
      toast({
        title: "Todo added!",
        description: "Your new task has been added successfully."
      });
    }
  };
  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const { error } = await supabase
      .from("todos")
      .update({ completed: !todo.completed })
      .eq("id", id);

    if (error) {
      console.error("Error updating todo:", error);
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive",
      });
    } else {
      setTodos(prev => prev.map(t => {
        if (t.id === id) {
          const updatedTodo = { ...t, completed: !t.completed };
          toast({
            title: updatedTodo.completed ? "Task completed!" : "Task reactivated",
            description: updatedTodo.completed ? "Great job! Keep up the momentum." : "Task moved back to active."
          });
          return updatedTodo;
        }
        return t;
      }));
    }
  };
  const deleteTodo = async (id: string) => {
    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting todo:", error);
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive",
      });
    } else {
      setTodos(prev => prev.filter(todo => todo.id !== id));
      toast({
        title: "Todo deleted",
        description: "The task has been removed from your list.",
        variant: "destructive"
      });
    }
  };
  const editTodo = async (id: string, newText: string) => {
    const { error } = await supabase
      .from("todos")
      .update({ text: newText })
      .eq("id", id);

    if (error) {
      console.error("Error updating todo:", error);
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive",
      });
    } else {
      setTodos(prev => prev.map(todo => todo.id === id ? { ...todo, text: newText } : todo));
      toast({
        title: "Todo updated",
        description: "Your task has been successfully updated."
      });
    }
  };
  const clearCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed);
    const completedIds = completedTodos.map(t => t.id);

    const { error } = await supabase
      .from("todos")
      .delete()
      .in("id", completedIds);

    if (error) {
      console.error("Error clearing completed todos:", error);
      toast({
        title: "Error",
        description: "Failed to clear completed todos",
        variant: "destructive",
      });
    } else {
      setTodos(prev => prev.filter(todo => !todo.completed));
      if (completedTodos.length > 0) {
        toast({
          title: "Completed tasks cleared",
          description: `Removed ${completedTodos.length} completed task${completedTodos.length > 1 ? 's' : ''}.`
        });
      }
    }
  };
  const markAllComplete = async () => {
    const activeTodos = todos.filter(todo => !todo.completed);
    const activeIds = activeTodos.map(t => t.id);

    if (activeIds.length === 0) return;

    const { error } = await supabase
      .from("todos")
      .update({ completed: true })
      .in("id", activeIds);

    if (error) {
      console.error("Error marking all complete:", error);
      toast({
        title: "Error",
        description: "Failed to mark all as complete",
        variant: "destructive",
      });
    } else {
      setTodos(prev => prev.map(todo => ({ ...todo, completed: true })));
      toast({
        title: "All tasks completed!",
        description: `Marked ${activeTodos.length} task${activeTodos.length > 1 ? 's' : ''} as complete.`
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };
  const filteredTodos = todos.filter(todo => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });
  const stats = {
    total: todos.length,
    active: todos.filter(todo => !todo.completed).length,
    completed: todos.filter(todo => todo.completed).length
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>;
  }

  return <div className="min-h-screen bg-gradient-secondary p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent flex-1">
              Todo App
            </h1>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
          <p className="text-muted-foreground text-xl">
            Stay organized and productive with your personal task manager
          </p>
        </div>

        <TodoStats todos={todos} />

        <div className="bg-gradient-card rounded-2xl shadow-card border border-border p-6 mb-6">
          <AddTodo onAdd={addTodo} />

          <TodoFilters activeFilter={filter} onFilterChange={setFilter} totalCount={stats.total} activeCount={stats.active} completedCount={stats.completed} />

          {todos.length > 0 && <div className="flex justify-center gap-2 mb-6">
              <Button variant="outline" size="sm" onClick={markAllComplete} disabled={stats.active === 0} className="border-todo-complete text-todo-complete hover:bg-todo-complete hover:text-white">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Complete All
              </Button>
              <Button variant="outline" size="sm" onClick={clearCompleted} disabled={stats.completed === 0} className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Completed
              </Button>
            </div>}

          <div className="space-y-3">
            {filteredTodos.length === 0 ? <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {filter === "all" ? "No todos yet" : filter === "active" ? "No active todos" : "No completed todos"}
                </h3>
                <p className="text-muted-foreground">
                  {filter === "all" ? "Add your first todo above to get started!" : filter === "active" ? "All tasks are completed! Great job!" : "Complete some tasks to see them here."}
                </p>
              </div> : filteredTodos.map(todo => <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} onEdit={editTodo} />)}
          </div>
        </div>
      </div>
    </div>;
};