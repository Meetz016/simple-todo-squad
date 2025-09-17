import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
interface AddTodoProps {
  onAdd: (text: string) => void;
}
export const AddTodo = ({
  onAdd
}: AddTodoProps) => {
  const [text, setText] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text.trim());
      setText("");
    }
  };
  return <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
      <div className="flex-1 relative">
        <Input value={text} onChange={e => setText(e.target.value)} placeholder="Add a new todo..." className="pr-12 bg-gradient-card border-border focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground" />
      </div>
      <Button type="submit" disabled={!text.trim()} className="bg-gradient-primary hover:shadow-elegant transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 px-[3px] mx-[15px]">
        <Plus className="h-4 w-4 mr-2" />
        Add Todo
      </Button>
    </form>;
};