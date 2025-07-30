import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Trash2, Megaphone, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Announcement } from "@shared/schema";
import { AddAnnouncementModal } from "./add-announcement-modal";

export function AnnouncementsBoard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/announcements"],
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/announcements/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({
        title: "Success",
        description: "Announcement deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete announcement. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 min-w-0 flex-1">
            <Megaphone className="h-5 w-5 flex-shrink-0" />
            <span className="truncate">Announcements</span>
          </CardTitle>
          <AddAnnouncementModal />
        </div>
      </CardHeader>
      <CardContent>
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium mb-1">No announcements yet</p>
            <p className="text-sm">Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`p-4 rounded-lg border-l-4 ${
                  announcement.isImportant
                    ? "border-l-red-500 bg-red-50 dark:bg-red-950/30"
                    : "border-l-blue-500 bg-blue-50 dark:bg-blue-950/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {announcement.isImportant && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <h3 className="font-semibold text-foreground">
                        {announcement.title}
                      </h3>
                      {announcement.isImportant && (
                        <Badge variant="destructive" className="text-xs">
                          Important
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>By {announcement.author}</span>
                      <span>•</span>
                      <span>
                        {format(new Date(announcement.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                    disabled={deleteAnnouncementMutation.isPending}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}