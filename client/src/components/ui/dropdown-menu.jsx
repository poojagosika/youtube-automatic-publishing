import { useState, useRef, useEffect, createContext, useContext } from "react";
import { cn } from "@/lib/utils";

const DropdownContext = createContext({ open: false, setOpen: () => {} });

const DropdownMenu = ({ children }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative" ref={ref}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

const DropdownMenuTrigger = ({ children, asChild, ...props }) => {
  const { open, setOpen } = useContext(DropdownContext);

  if (asChild) {
    return (
      <div onClick={() => setOpen(!open)} {...props}>
        {children}
      </div>
    );
  }

  return (
    <button onClick={() => setOpen(!open)} {...props}>
      {children}
    </button>
  );
};

const DropdownMenuContent = ({ children, className, align = "start" }) => {
  const { open } = useContext(DropdownContext);

  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute top-full mt-1 z-50 min-w-[8rem] overflow-hidden rounded-lg border border-surface-200 bg-white p-1 shadow-lg animate-slide-down",
        align === "end" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  );
};

const DropdownMenuItem = ({ children, className, onClick, ...props }) => {
  const { setOpen } = useContext(DropdownContext);

  const handleClick = () => {
    onClick?.();
    setOpen(false);
  };

  return (
    <button
      className={cn(
        "flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm text-surface-700 outline-none transition-colors hover:bg-surface-100",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

const DropdownMenuSeparator = ({ className }) => (
  <div className={cn("-mx-1 my-1 h-px bg-surface-200", className)} />
);

const DropdownMenuLabel = ({ children, className }) => (
  <div
    className={cn(
      "px-2 py-1.5 text-xs font-semibold text-surface-500 uppercase tracking-wider",
      className
    )}
  >
    {children}
  </div>
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
};
