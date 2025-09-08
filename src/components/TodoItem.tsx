import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
}

export const TodoItem = ({ todo, onToggle, onDelete, onEdit }: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleEdit = () => {
    if (editText.trim()) {
      onEdit(todo.id, editText.trim());
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  return (
    <div className="group animate-fade-in bg-gradient-card rounded-xl p-4 shadow-card border border-border hover:shadow-elegant transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => onToggle(todo.id)}
            className="w-5 h-5 border-2 border-primary data-[state=checked]:bg-todo-complete data-[state=checked]:border-todo-complete"
          />
          {todo.completed && (
            <Check className="absolute inset-0 w-3 h-3 text-white animate-check m-auto" />
          )}
        </div>

        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEdit();
                  if (e.key === "Escape") handleCancel();
                }}
                className="flex-1 bg-background/50"
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleEdit}
                variant="outline"
                className="h-8 w-8 p-0 border-todo-complete text-todo-complete hover:bg-todo-complete hover:text-white"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={handleCancel}
                variant="outline"
                className="h-8 w-8 p-0 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p
              className={`text-sm font-medium cursor-pointer ${
                todo.completed
                  ? "line-through text-todo-text-complete"
                  : "text-foreground"
              } transition-colors duration-200`}
              onClick={() => !todo.completed && setIsEditing(true)}
            >
              {todo.text}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {!isEditing && !todo.completed && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(todo.id)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        {todo.createdAt.toLocaleDateString()} {todo.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};