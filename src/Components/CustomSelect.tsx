import React, { useEffect, useRef, useState } from "react";

type Option = { label: string; value: string };

interface Props {
  label?: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
}

const CustomSelect: React.FC<Props> = ({ label, value, options, onChange, className }) => {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number>(() =>
    Math.max(0, options.findIndex(o => o.value === value))
  );
  const ref = useRef<HTMLDivElement>(null);

  const current = options.find(o => o.value === value) || options[0];

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Navegación con teclado
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (open) {
      if (e.key === "Escape") { setOpen(false); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(options.length - 1, i + 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(0, i - 1)); }
      if (e.key === "Enter") {
        e.preventDefault();
        const opt = options[activeIdx];
        if (opt) onChange(opt.value);
        setOpen(false);
      }
    }
  };

  const handleSelect = (idx: number) => {
    const opt = options[idx];
    onChange(opt.value);
    setActiveIdx(idx);
    setOpen(false);
  };

  return (
    <div
      className={`custom-select ${className || ""}`}
      ref={ref}
      tabIndex={0}
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-controls="custom-select-list"
      onKeyDown={onKeyDown}
    >
      {label && <span className="custom-select__label">{label}</span>}
      <button
        type="button"
        className={`custom-select__control ${open ? "open" : ""}`}
        onClick={() => setOpen(o => !o)}
        aria-label={label || "Selector"}
      >
        <span className="custom-select__value">{current?.label}</span>
        <span className="custom-select__chevron" />
      </button>

      {/* Overlay difuminado */}
      {open && <div className="custom-select__overlay" onClick={() => setOpen(false)} />}

      {/* Menú desplegable */}
      {open && (
        <ul className="custom-select__menu" role="listbox" id="custom-select-list">
          {options.map((opt, idx) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              className={`custom-select__option ${idx === activeIdx ? "active" : ""} ${value === opt.value ? "selected" : ""}`}
              onMouseEnter={() => setActiveIdx(idx)}
              onClick={() => handleSelect(idx)}
            >
              <span>{opt.label}</span>
              {value === opt.value && <span className="custom-select__tick">✓</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
