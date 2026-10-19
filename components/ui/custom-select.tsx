"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
}

export interface CustomSelectProps {
  name?: string;
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: (SelectOption | string)[];
  placeholder?: string;
  disabled?: boolean;
  disabledMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  buttonClassName?: string;
  error?: boolean;
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

export function CustomSelect({
  name,
  id,
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  disabled = false,
  disabledMessage,
  searchable,
  searchPlaceholder = "Search...",
  className,
  buttonClassName,
  error = false,
  size = "md",
  icon,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const selectId = id || generatedId;

  // Normalize options to SelectOption[]
  const normalizedOptions: SelectOption[] = React.useMemo(() => {
    return options.map((opt) =>
      typeof opt === "string" ? { value: opt, label: opt } : opt
    );
  }, [options]);

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Automatically enable search if more than 7 options unless explicitly disabled
  const showSearch =
    searchable !== undefined ? searchable : normalizedOptions.length > 7;

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const query = searchQuery.toLowerCase();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.value.toLowerCase().includes(query)
    );
  }, [normalizedOptions, searchQuery]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && showSearch) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
    }
  }, [isOpen, showSearch]);

  // Measure available space to decide whether to open upward or downward
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      // If there is less than 240px below and more space above, open upwards
      if (spaceBelow < 240 && rect.top > spaceBelow) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" || e.key === " ") {
      if (!isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    }
  };

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery("");
  };

  const isSm = size === "sm";

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full select-none", isOpen ? "z-50" : "z-10", className)}
      onKeyDown={handleKeyDown}
    >
      {/* Hidden input to support standard HTML form submissions & FormData */}
      {name && <input type="hidden" name={name} id={selectId} value={value} />}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "group relative flex w-full items-center justify-between transition-all duration-200 outline-none text-left",
          isSm
            ? "rounded-xl border border-slate-200/90 bg-white/90 px-3 py-1.5 text-xs font-medium backdrop-blur-md"
            : "rounded-2xl border border-white/80 bg-white/85 px-4 py-3 text-sm font-medium shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)] backdrop-blur-xl",
          !disabled && "hover:bg-white hover:border-slate-300 hover:shadow-md cursor-pointer",
          isOpen && "ring-2 ring-slate-950/10 border-slate-400 bg-white shadow-md",
          error && "border-rose-300 ring-2 ring-rose-400/20",
          disabled && "cursor-not-allowed opacity-60 bg-slate-50/70 border-slate-200/60 shadow-none",
          buttonClassName
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5 pr-2">
          {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
          <span
            className={cn(
              "block truncate",
              selectedOption
                ? "text-slate-900 font-medium"
                : "text-slate-400 font-normal"
            )}
          >
            {disabled && disabledMessage
              ? disabledMessage
              : selectedOption
              ? selectedOption.label
              : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 pl-1">
          <ChevronDown
            className={cn(
              "transition-transform duration-200 text-slate-400 group-hover:text-slate-600",
              isSm ? "size-3.5" : "size-4",
              isOpen && "rotate-180 text-slate-900"
            )}
          />
        </div>
      </button>

      {/* Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: openUpwards ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openUpwards ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            role="listbox"
            className={cn(
              "absolute z-50 left-0 right-0 overflow-hidden",
              openUpwards ? "bottom-full mb-2" : "top-full mt-2",
              "rounded-2xl border border-white/80 bg-white/95 p-1.5 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.22)] backdrop-blur-2xl ring-1 ring-black/5"
            )}
          >
            {/* Search Box if needed */}
            {showSearch && (
              <div className="relative mb-1.5 px-1 pt-1">
                <div className="relative flex items-center">
                  <Search className="pointer-events-none absolute left-3 size-3.5 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50/80 py-1.5 pr-8 pl-8 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400/30"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 grid size-4 place-items-center rounded-full text-slate-400 hover:text-slate-600"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto overscroll-contain py-0.5 pr-1 space-y-0.5 custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-slate-400">
                  {searchQuery ? "No matching options found" : "No options available"}
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(option.value)}
                      className={cn(
                        "group relative flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all duration-150 cursor-pointer",
                        isSm ? "text-xs" : "text-xs sm:text-sm",
                        isSelected
                          ? "bg-slate-950 text-white font-semibold shadow-sm"
                          : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-950 font-medium"
                      )}
                    >
                      <span className="truncate pr-2">{option.label}</span>
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.15 }}
                          className="shrink-0 text-white"
                        >
                          <Check className={isSm ? "size-3.5" : "size-4"} />
                        </motion.span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
