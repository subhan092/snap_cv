import { Controller } from "react-hook-form";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface DatePickerFieldProps {
  control: any;
  name: string;
  label: string;
  error?: any;
}

export const DatePickerField = ({
  control,
  name,
  label,
  error,
}: DatePickerFieldProps) => {
  return (
    <div className="space-y-2">
      <label>{label}</label>

      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                {field.value
                  ? format(field.value, "PPP")
                  : "Pick a date"}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
              />
            </PopoverContent>
          </Popover>
        )}
      />

      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
};