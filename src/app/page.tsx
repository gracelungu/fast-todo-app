"use client";

import { useEffect, useMemo, useState } from "react";

type Todo = { id: string; text: string; completed: boolean };

export default function Page() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  useEffect(() => {
    const saved = localStorage.getItem("zentask-mvp");
    if (saved) setTodos(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("zentask-mvp", JSON.stringify(todos));
  }, [todos]);

  const visible = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  const total = todos.length;
  const done = todos.filter((t) => t.completed).length;
  const active = total - done;

  const addTodo = () => {
    const v = text.trim();
    if (!v) return;
    setTodos((p) => [{ id: crypto.randomUUID(), text: v, completed: false }, ...p]);
    setText("");
  };

  const toggle = (id: string) => setTodos((p) => p.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  const remove = (id: string) => setTodos((p) => p.filter((t) => t.id !== id));
  const edit = (id: string, next: string) => setTodos((p) => p.map((t) => (t.id === id ? { ...t, text: next } : t)));

  return (
    <main className="min-h-screen bg-[#0b1220] text-white p-4 md:p-6">
      <div className="mx-auto w-full max-w-xl rounded-3xl bg-[#111a2b] border border-white/10 shadow-2xl p-5 space-y-4">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">ZenTask</h1>
            <p className="text-sm text-slate-300">Monday, Feb 9</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">MVP Core</span>
        </header>

        <section className="grid grid-cols-3 gap-2">
          <Stat label="Total" value={total} />
          <Stat label="Active" value={active} />
          <Stat label="Done" value={done} />
        </section>

        <section className="flex gap-2">
          <input
            className="flex-1 rounded-xl bg-[#0d1525] border border-white/10 px-3 py-2 outline-none focus:border-cyan-400"
            placeholder="Focus on a new task..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <button onClick={addTodo} className="rounded-xl px-4 py-2 bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400">Add</button>
        </section>

        <section className="flex gap-2 text-sm">
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 border ${filter === f ? "bg-cyan-500 text-slate-950 border-cyan-400" : "bg-[#0d1525] border-white/10 text-slate-300"}`}
            >
              {f}
            </button>
          ))}
        </section>

        <section className="space-y-2 min-h-[140px]">
          {visible.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#0d1525] p-5 text-center text-slate-300">
              <p>No tasks found in "{filter}"</p>
              <p className="text-sm text-slate-400 mt-1">Peace of mind awaits.</p>
            </div>
          ) : (
            visible.map((t) => <Row key={t.id} todo={t} onToggle={toggle} onDelete={remove} onEdit={edit} />)
          )}
        </section>

        <footer className="text-xs text-center text-slate-400">ZenTask MVP • Double click to edit task</footer>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-[#0d1525] border border-white/10 p-3 text-center">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function Row({ todo, onToggle, onDelete, onEdit }: { todo: Todo; onToggle: (id: string) => void; onDelete: (id: string) => void; onEdit: (id: string, value: string) => void; }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(todo.text);

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d1525] px-3 py-2 flex items-center gap-2">
      <input type="checkbox" checked={todo.completed} onChange={() => onToggle(todo.id)} />
      {editing ? (
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onEdit(todo.id, value.trim() || todo.text);
              setEditing(false);
            }
          }}
          className="flex-1 bg-transparent border-b border-cyan-400 outline-none"
        />
      ) : (
        <p
          onDoubleClick={() => setEditing(true)}
          className={`flex-1 ${todo.completed ? "line-through text-slate-500" : "text-slate-100"}`}
        >
          {todo.text}
        </p>
      )}
      <button onClick={() => setEditing((v) => !v)} className="text-xs px-2 py-1 rounded border border-white/20">{editing ? "Save" : "Edit"}</button>
      <button onClick={() => onDelete(todo.id)} className="text-xs px-2 py-1 rounded border border-rose-500/40 text-rose-300">Delete</button>
    </div>
  );
}
