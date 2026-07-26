"use client";

import * as React from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function DateTimePicker({ value, onChange, disabled }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse hours and minutes from the value or default to "12:00" if no value
  const timeValue = React.useMemo(() => {
    if (!value) return "12:00";
    const hours = value.getHours().toString().padStart(2, "0");
    const minutes = value.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange(undefined);
      return;
    }

    // Preserve the existing time when a new date is selected
    const newDateTime = new Date(selectedDate);
    if (value) {
      newDateTime.setHours(value.getHours(), value.getMinutes(), 0, 0);
    } else {
      // Default to 12:00 if it's a new date selection
      newDateTime.setHours(12, 0, 0, 0);
    }
    
    onChange(newDateTime);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeString = e.target.value;
    if (!timeString || !value) return;

    const [hours, minutes] = timeString.split(":").map(Number);
    const newDateTime = new Date(value);
    
    if (!isNaN(hours) && !isNaN(minutes)) {
      newDateTime.setHours(hours, minutes, 0, 0);
      onChange(newDateTime);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full justify-start text-left font-normal",
          !value && "text-muted-foreground"
        )}
        disabled={disabled}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value ? format(value, "dd MMM yyyy, HH:mm", { locale: id }) : <span>Pilih tanggal dan waktu</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
        />
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="time" className="sr-only">Waktu</Label>
            <Input
              id="time"
              type="time"
              value={timeValue}
              onChange={handleTimeChange}
              disabled={!value}
              className="w-[120px]"
            />
            {!value && (
              <span className="text-xs text-muted-foreground">
                Pilih tanggal dulu
              </span>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
