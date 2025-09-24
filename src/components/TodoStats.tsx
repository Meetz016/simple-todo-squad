import { Todo } from "./TodoItem";
interface TodoStatsProps {
  todos: Todo[];
}
export const TodoStats = ({
  todos
}: TodoStatsProps) => {
  const completedTodos = todos.filter(todo => todo.completed).length;
  const totalTodos = todos.length;
  const completionPercentage = totalTodos === 0 ? 0 : Math.round(completedTodos / totalTodos * 100);
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gradient-card rounded-xl p-4 border border-border text-center">
        <div className="text-2xl font-bold text-foreground">{totalTodos}</div>
        <div className="text-sm text-muted-foreground mx-[11px]">Total Tasks</div>
      </div>
      
      <div className="bg-gradient-card rounded-xl p-4 border border-border text-center bg-gray-300">
        <div className="text-2xl font-bold text-todo-complete">{completedTodos}</div>
        <div className="text-sm text-muted-foreground">Completed</div>
      </div>
      
      <div className="bg-gradient-card rounded-xl p-4 border border-border text-center">
        <div className="text-2xl font-bold text-todo-pending">{completionPercentage}%</div>
        <div className="text-sm text-muted-foreground">Progress</div>
      </div>
    </div>;
};