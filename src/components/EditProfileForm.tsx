'use client';

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Phone, User, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  dateOfBirth: z.string().min(1, "Please select your date of birth"),
  gender: z.string().min(1, "Please select your gender"),
  location: z.string().min(2, "Location must be at least 2 characters"),
});

type FormData = z.infer<typeof formSchema>;

interface EditProfileFormProps {
  initialData: FormData;
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
  onFormDirtyChange?: (isDirty: boolean) => void;
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({
  initialData,
  onSubmit,
  isLoading,
  onFormDirtyChange,
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    initialData.dateOfBirth ? new Date(initialData.dateOfBirth) : undefined
  );

  // Watch all fields for changes
  const watchAllFields = form.watch();

  // Determine if form is dirty (including DOB change)
  const isFormDirty = React.useMemo(() => {
    return (
      form.formState.isDirty ||
      (selectedDate && format(selectedDate, "yyyy-MM-dd") !== initialData.dateOfBirth)
    );
  }, [form.formState.isDirty, selectedDate, initialData.dateOfBirth]);

  // Notify parent when dirty state changes
  function isFunction(value: any): value is Function {
    return typeof value === "function";
  }
  
  useEffect(() => {
    if (isFunction(onFormDirtyChange)) {
      onFormDirtyChange(isFormDirty);
    }
  }, [watchAllFields, selectedDate, isFormDirty, onFormDirtyChange]);
  
  const handleFormSubmit = (data: FormData) => {
    if (!isFormDirty) return;
    onSubmit({
      ...data,
      dateOfBirth: selectedDate ? format(selectedDate, "yyyy-MM-dd") : data.dateOfBirth,
    });
  };

  return (
    <Form {...form}>
      <form
        id="profile-form"
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter your full name"
                    className="input-focus h-11 gradient-card border-border shadow-soft bg-white/80"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                  <span className="w-4 h-4 text-primary flex items-center justify-center text-xs">@</span>
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Enter your email"
                    className="input-focus h-11 gradient-card border-border shadow-soft bg-white/80"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  Phone Number
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter your phone number"
                    className="input-focus h-11 gradient-card border-border shadow-soft bg-white/80"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date of Birth */}
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Date of Birth
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full h-11 justify-start text-left font-normal gradient-card border-border shadow-soft input-focus bg-white/80 ${
                          !selectedDate ? "text-muted-foreground" : ""
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 gradient-card border-border shadow-glow"
                    align="start"
                  >
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                      }}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                      className="p-3 pointer-events-auto bg-white/80"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gender */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Gender
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11 gradient-card border-border shadow-soft input-focus bg-white/80">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="gradient-card border-border shadow-glow bg-white">
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                    <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Location
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter your location"
                    className="input-focus h-11 gradient-card border-border shadow-soft bg-white/80"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};
