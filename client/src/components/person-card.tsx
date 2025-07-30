import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Edit, Flame, Smile, Trash2, MoreVertical } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Person } from "@shared/schema";
import EmojiPicker from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditPersonModal } from "./edit-person-modal";

interface PersonCardProps {
  person: Person;
}

export function PersonCard({ person }: PersonCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProgressMutation = useMutation({
    mutationFn: async ({ day, completed }: { day: string; completed: boolean }) => {
      const response = await apiRequest("PATCH", "/api/people/progress", {
        personId: person.id,
        day,
        completed,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/people"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    },
  });

  const deletePersonMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/people/${person.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/people"] });
      toast({
        title: "Success",
        description: "Person deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete person",
        variant: "destructive",
      });
    },
  });

  const allDays = [
    { key: "monday", label: "M" },
    { key: "tuesday", label: "T" },
    { key: "wednesday", label: "W" },
    { key: "thursday", label: "T" },
    { key: "friday", label: "F" },
    { key: "saturday", label: "S" },
  ];

  // Calculate progress based on target type
  let completedCount = 0;
  let targetCount = 0;
  let completionRate = 0;

  if (person.targetType === "specific_days") {
    const targetDays = allDays.filter(day => person.targetDays.includes(day.key));
    completedCount = targetDays.filter(day => 
      person.weeklyProgress[day.key as keyof typeof person.weeklyProgress]
    ).length;
    targetCount = targetDays.length;
  } else {
    // For days_per_week type, count all completed days
    completedCount = allDays.filter(day => 
      person.weeklyProgress[day.key as keyof typeof person.weeklyProgress]
    ).length;
    targetCount = person.targetCount || 6;
  }
  
  completionRate = targetCount > 0 ? Math.round((completedCount / targetCount) * 100) : 0;

  const handleDayToggle = (day: string, currentState: boolean) => {
    updateProgressMutation.mutate({
      day,
      completed: !currentState,
    });
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 w-full overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
            {person.emoji}
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-900">{person.name}</h3>
            <p className="text-sm text-gray-600">{person.goal}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{person.emoji}</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => deletePersonMutation.mutate()}
                disabled={deletePersonMutation.isPending}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {person.targetType === "specific_days" ? "Weekly Progress" : `Target: ${targetCount} days`}
          </span>
          <span className="text-sm text-gray-500">{completedCount}/{targetCount} days</span>
        </div>
        
        <div className="grid grid-cols-6 gap-1 sm:gap-2">
          {allDays.map((day) => {
            const isCompleted = person.weeklyProgress[day.key as keyof typeof person.weeklyProgress];
            const isTargetDay = person.targetType === "specific_days" ? person.targetDays.includes(day.key) : true;
            const isDisabled = person.targetType === "days_per_week" && !isCompleted && completedCount >= targetCount;
            
            return (
              <Button
                key={day.key}
                onClick={() => handleDayToggle(day.key, isCompleted)}
                disabled={updateProgressMutation.isPending || isDisabled}
                className={`h-10 min-w-0 rounded-lg border-2 font-medium text-xs sm:text-sm transition-all hover:scale-105 ${
                  isCompleted
                    ? "border-emerald-500 bg-emerald-500 text-white hover:border-emerald-600"
                    : isTargetDay 
                      ? "border-gray-300 bg-white text-gray-400 hover:border-gray-400"
                      : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                }`}
              >
                {isCompleted ? <span className="text-sm sm:text-lg">{person.emoji}</span> : day.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Completion Rate</span>
          <span>{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Current Streak */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center text-gray-600">
          <Flame className="text-orange-500 mr-1 h-4 w-4" />
          <span>
            Current Streak: <span className="font-semibold">{person.currentStreak} days</span>
          </span>
        </div>
        <span className="text-xs text-gray-500">
          Updated {new Date(person.updatedAt).toLocaleTimeString([], { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          })}
        </span>
      </div>
      
      <EditPersonModal 
        person={person}
        open={showEditModal} 
        onOpenChange={setShowEditModal}
      />
    </Card>
  );
}
