import { Card } from "@/components/ui/card";
import { Users, Target, Calendar, Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Stats {
  totalPeople: number;
  activeGoals: number;
  weekCompletion: string;
  streakRecord: string;
}

export function StatsOverview() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex items-center">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="bg-gray-200 rounded-lg p-3 w-12 h-12"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total People",
      value: stats?.totalPeople || 0,
      icon: Users,
      bgColor: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      title: "Active Goals",
      value: stats?.activeGoals || 0,
      icon: Target,
      bgColor: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Week Completion",
      value: stats?.weekCompletion || "0%",
      icon: Calendar,
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Streak Record",
      value: stats?.streakRecord || "0 days",
      icon: Flame,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`${stat.bgColor} rounded-lg p-3`}>
              <stat.icon className={`${stat.iconColor} text-xl h-6 w-6`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
