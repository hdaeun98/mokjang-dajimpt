import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Cloud } from "lucide-react";
import { PersonCard } from "@/components/person-card";
import { AddPersonModal } from "@/components/add-person-modal";
import { AnnouncementsBoard } from "@/components/announcements-board";
import type { Person } from "@shared/schema";
import logo from "@/assets/logo.png";

export default function Dashboard() {
  const { data: people, isLoading, error } = useQuery<Person[]>({
    queryKey: ["/api/people"],
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">Failed to load progress data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <TrendingUp className="text-2xl text-indigo-600 mr-3 h-8 w-8" />
              <h1 className="text-xl font-semibold text-gray-900">Mokjang Dajim Points</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center text-sm text-gray-500">
                <Cloud className="text-emerald-500 mr-1 h-4 w-4" />
                <span>Synced</span>
              </div>
              <AddPersonModal />
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Announcements Board */}
        <div className="mb-8">
          <AnnouncementsBoard />
        </div>

        {/* People Progress Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="ml-3">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="flex space-x-2">
                    {[...Array(6)].map((_, j) => (
                      <div key={j} className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                  <div className="h-2 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        ) : people && people.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {people.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No people added yet</h3>
              <p className="text-gray-500 mb-6">
                Get started by adding your first person and their daily goal.
              </p>
              <AddPersonModal />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
