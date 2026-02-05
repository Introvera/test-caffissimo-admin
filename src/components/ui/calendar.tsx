"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isWithinInterval,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
  fromDate?: Date;
  toDate?: Date;
}

export function Calendar({
  selected,
  onSelect,
  className,
  fromDate,
  toDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selected || new Date());

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-2 py-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    return (
      <div className="grid grid-cols-7 mb-1">
        {days.map((day) => (
          <div
            key={day}
            className="text-center text-xs text-muted-foreground font-medium py-2"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = selected && isSameDay(day, selected);
        const isDisabled =
          (fromDate && day < fromDate) || (toDate && day > toDate);

        days.push(
          <button
            key={day.toString()}
            className={cn(
              "h-9 w-9 text-center text-sm p-0 font-normal rounded-md transition-colors",
              !isCurrentMonth && "text-muted-foreground opacity-50",
              isSelected && "bg-primary text-primary-foreground",
              !isSelected && isCurrentMonth && "hover:bg-accent",
              isDisabled && "opacity-30 cursor-not-allowed"
            )}
            onClick={() => !isDisabled && onSelect?.(cloneDay)}
            disabled={isDisabled}
            type="button"
          >
            {format(day, "d")}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <div className={cn("p-3", className)}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}

interface DateRangeCalendarProps {
  from?: Date;
  to?: Date;
  onSelect?: (range: { from?: Date; to?: Date }) => void;
  className?: string;
}

export function DateRangeCalendar({
  from,
  to,
  onSelect,
  className,
}: DateRangeCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(from || new Date());
  const [selecting, setSelecting] = React.useState<"from" | "to">("from");

  const handleSelect = (date: Date) => {
    if (selecting === "from") {
      onSelect?.({ from: date, to: undefined });
      setSelecting("to");
    } else {
      if (from && date < from) {
        onSelect?.({ from: date, to: from });
      } else {
        onSelect?.({ from, to: date });
      }
      setSelecting("from");
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-2 py-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    return (
      <div className="grid grid-cols-7 mb-1">
        {days.map((day) => (
          <div
            key={day}
            className="text-center text-xs text-muted-foreground font-medium py-2"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isFrom = from && isSameDay(day, from);
        const isTo = to && isSameDay(day, to);
        const isInRange =
          from && to && isWithinInterval(day, { start: from, end: to });

        days.push(
          <button
            key={day.toString()}
            className={cn(
              "h-9 w-9 text-center text-sm p-0 font-normal rounded-md transition-colors",
              !isCurrentMonth && "text-muted-foreground opacity-50",
              (isFrom || isTo) && "bg-primary text-primary-foreground",
              isInRange && !isFrom && !isTo && "bg-accent",
              !isFrom && !isTo && isCurrentMonth && "hover:bg-accent"
            )}
            onClick={() => handleSelect(cloneDay)}
            type="button"
          >
            {format(day, "d")}
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }
    return <div className="space-y-1">{rows}</div>;
  };

  return (
    <div className={cn("p-3", className)}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}
