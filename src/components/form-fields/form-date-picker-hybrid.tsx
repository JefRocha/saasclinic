/* src/components/form-fields/form-date-picker-hybrid.tsx */
"use client";

import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Calendar as CalendarIcon } from "lucide-react";

/* ─ util: DD/MM/AAAA ─ */
const fmt = (d: Date) =>
  d
    .toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/-/g, "/");
const parse = (s: string) => {
  const [dd, mm, yy] = s.split("/").map(Number);
  return s.length === 10 ? new Date(yy, mm - 1, dd) : null;
};

const formatIsoLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
};

/* ─ props ─ */
interface Props {
  value?: string; // ISO yyyy-MM-dd
  onChange?: (iso: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

/* ─ componente ─ */
export const FormDatePickerHybrid = forwardRef<HTMLInputElement, Props>(
  (
    {
      value,
      onChange,
      placeholder = "DD/MM/AAAA",
      label,
      error,
      disabled,
      className,
    },
    ref
  ) => {
    const [input, setInput] = useState("");
    const [open, setOpen] = useState(false);
    const [selDate, setSelDate] = useState<Date | null>(null);
    const [cursor, setCursor] = useState(new Date());
    const [msg, setMsg] = useState("");

    /* refs locais + expose para parent */
    const inputRef = useRef<HTMLInputElement | null>(null);
    const popRef = useRef<HTMLDivElement | null>(null);
    useImperativeHandle(ref, () => inputRef.current!);

    /* util: parse ISO (YYYY-MM-DD) as LOCAL date (avoid UTC shift) */
    const parseIsoLocal = (iso: string): Date | null => {
      const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (!m) return null;
      const y = Number(m[1]);
      const mo = Number(m[2]) - 1;
      const da = Number(m[3]);
      const d = new Date(y, mo, da);
      return isNaN(d.getTime()) ? null : d;
    };

    /* sync externa → interna */
    useEffect(() => {
      if (value) {
        const d = parseIsoLocal(value);
        if (d) {
          setSelDate(d);
          setInput(fmt(d));
          setCursor(d);
        }
      }
    }, [value]);

    /* máscara progressiva */
    const mask = (v: string) => {
      const n = v.replace(/\D/g, "");
      if (n.length <= 2) return n;
      if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
      return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4, 8)}`;
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const m = mask(e.target.value);
      setInput(m);

      if (m.length === 10) {
        const d = parse(m);
        if (d && !isNaN(d.getTime())) {
          setSelDate(d);
          setCursor(d);
          setMsg("");
          onChange?.(formatIsoLocal(d));
        } else {
          setMsg("Data inválida");
          setSelDate(null);
        }
      } else {
        setMsg("");
        setSelDate(null);
      }
    };

    const handleKey = (e: React.KeyboardEvent) => {
      if (e.key === "F4" || e.key === "Enter") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") setOpen(false);
    };

    /* calendário */
    const days = () => {
      const y = cursor.getFullYear();
      const m = cursor.getMonth();
      const first = new Date(y, m, 1);
      const start = new Date(first);
      start.setDate(start.getDate() - first.getDay());
      return Array.from({ length: 42 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
      });
    };

    const pick = (d: Date) => {
      setSelDate(d);
      setInput(fmt(d));
      setMsg("");
      setOpen(false);
      onChange?.(formatIsoLocal(d));
      inputRef.current?.focus();
    };

    /* click-outside */
    useEffect(() => {
      const out = (e: MouseEvent) => {
        if (popRef.current && !popRef.current.contains(e.target as Node))
          setOpen(false);
      };
      if (open) {
        document.addEventListener("mousedown", out);
        return () => document.removeEventListener("mousedown", out);
      }
    }, [open]);

    /* ─ render ─ */
    return (
      <div className={`relative ${className ?? ""}`}>
        {label && (
          <label className="mb-1 block text-sm font-medium">{label}</label>
        )}

        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKey}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={10}
            className={`
              className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              "disabled:cursor-not-allowed disabled:opacity-50",
              (error || msg) ? "border-destructive" : "border-input",
              open ? "ring-1 ring-ring" : "",
              "pr-10" // Keep this for the icon
            )}
            `}
          />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            disabled={disabled}
            className={`
              absolute right-2 top-1/2 -translate-y-1/2 transform rounded p-1
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${open ? "bg-blue-50 text-blue-600" : "text-gray-500"}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            <CalendarIcon size={16} />
          </button>
        </div>

        {(error || msg) && (
          <p className="mt-1 text-xs text-red-500">{error || msg}</p>
        )}

        {open && (
          <div
            ref={popRef}
            className="absolute z-50 mt-1 rounded-md border border-gray-300 bg-white shadow-lg"
          >
            {/* header */}
            <div className="flex items-center justify-between border-b p-3">
              <button
                type="button"
                onClick={() =>
                  setCursor(
                    new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1)
                  )
                }
                className="rounded p-1 hover:bg-gray-100"
              >
                ←
              </button>
              <h3 className="font-medium">
                {cursor.toLocaleDateString("pt-BR", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <button
                type="button"
                onClick={() =>
                  setCursor(
                    new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
                  )
                }
                className="rounded p-1 hover:bg-gray-100"
              >
                →
              </button>
            </div>

            {/* weekday labels */}
            <div className="grid grid-cols-7 border-b text-center text-xs font-medium text-gray-500">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                <div key={d} className="p-2">
                  {d}
                </div>
              ))}
            </div>

            {/* days */}
            <div className="grid grid-cols-7">
              {days().map((d, i) => {
                const sameM = d.getMonth() === cursor.getMonth();
                const isSel =
                  selDate && d.toDateString() === selDate.toDateString();
                const isToday = d.toDateString() === new Date().toDateString();

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => pick(d)}
                    className={`
                      p-2 text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500
                      ${sameM ? "text-gray-900" : "text-gray-400"}
                      ${isSel ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                      ${
                        isToday && !isSel
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : ""
                      }
                    `}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

            {/* footer */}
            <div className="flex items-center justify-between border-t bg-gray-50 p-3 text-xs">
              <button
                type="button"
                onClick={() => pick(new Date())}
                className="text-blue-600 hover:text-blue-800"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
);
FormDatePickerHybrid.displayName = "FormDatePickerHybrid";
