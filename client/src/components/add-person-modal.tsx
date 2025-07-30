import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Smile } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPersonSchema, type InsertPerson } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import EmojiPicker from "emoji-picker-react";

export function AddPersonModal() {
  const [open, setOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("🔥");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]);
  const [targetType, setTargetType] = useState<"specific_days" | "days_per_week">("specific_days");
  const [targetCount, setTargetCount] = useState(6);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertPerson>({
    resolver: zodResolver(insertPersonSchema),
    defaultValues: {
      name: "",
      goal: "",
      emoji: "🔥",
      targetType: "specific_days",
      targetDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
      targetCount: 6,
    },
  });

  const createPersonMutation = useMutation({
    mutationFn: async (data: InsertPerson) => {
      const response = await apiRequest("POST", "/api/people", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/people"] });
      toast({
        title: "Success",
        description: "Person added successfully!",
      });
      setOpen(false);
      form.reset();
      setSelectedEmoji("🔥");
      setSelectedDays(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add person",
        variant: "destructive",
      });
    },
  });

  // Update form values when target type changes
  useEffect(() => {
    form.setValue("targetType", targetType);
    if (targetType === "specific_days") {
      form.setValue("targetDays", selectedDays);
      form.setValue("targetCount", undefined);
    } else {
      form.setValue("targetCount", targetCount);
      form.setValue("targetDays", ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]);
    }
  }, [targetType, selectedDays, targetCount, form]);

  const onSubmit = (data: InsertPerson) => {
    const submitData = {
      ...data,
      emoji: selectedEmoji,
      targetType,
      ...(targetType === "specific_days" 
        ? { targetDays: selectedDays } 
        : { targetCount, targetDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] }
      )
    };
    createPersonMutation.mutate(submitData);
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const dayOptions = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center">
          <Plus className="mr-2 h-4 w-4" />
          Add Person
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">Add New Person</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter person's name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-colors"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Goal Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3}
                      placeholder="Describe the daily goal (e.g., Exercise for 30 minutes)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-colors resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Completion Emoji</Label>
              <div className="flex items-center space-x-3">
                <div className="text-4xl">{selectedEmoji}</div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="flex items-center space-x-2"
                >
                  <Smile className="h-4 w-4" />
                  <span>Choose Emoji</span>
                </Button>
              </div>
              {showEmojiPicker && (
                <div className="mt-3 relative">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setSelectedEmoji(emojiData.emoji);
                      setShowEmojiPicker(false);
                    }}
                    width={350}
                    height={400}
                  />
                </div>
              )}
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-3">Target Days</Label>
              
              <RadioGroup value={targetType} onValueChange={(value: "specific_days" | "days_per_week") => setTargetType(value)} className="mb-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific_days" id="specific_days" />
                  <Label htmlFor="specific_days" className="text-sm">Choose specific days of the week</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="days_per_week" id="days_per_week" />
                  <Label htmlFor="days_per_week" className="text-sm">Set number of days per week</Label>
                </div>
              </RadioGroup>

              {targetType === "specific_days" ? (
                <div>
                  <div className="grid grid-cols-2 gap-2">
                    {dayOptions.map((day) => (
                      <Button
                        key={day.key}
                        type="button"
                        onClick={() => toggleDay(day.key)}
                        variant="outline"
                        className={`p-3 text-sm font-medium transition-all ${
                          selectedDays.includes(day.key)
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''} per week
                  </p>
                </div>
              ) : (
                <div>
                  <Label className="block text-sm text-gray-600 mb-2">Number of days per week:</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setTargetCount(Math.max(1, targetCount - 1))}
                      disabled={targetCount <= 1}
                    >
                      -
                    </Button>
                    <span className="text-lg font-medium w-8 text-center">{targetCount}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setTargetCount(Math.min(6, targetCount + 1))}
                      disabled={targetCount >= 6}
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Complete {targetCount} day{targetCount !== 1 ? 's' : ''} any time during the week
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createPersonMutation.isPending}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                {createPersonMutation.isPending ? "Adding..." : "Add Person"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
