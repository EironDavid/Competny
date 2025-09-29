import { useEffect, useState } from "react";
import AdminLayout from "@/components/layouts/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  ArrowDown,
  ArrowUp,
  PieChart,
  BarChart,
  Users,
  PawPrint,
  CheckCircle,
  Clock,
  User
} from "lucide-react";
import ApplicationStatusBadge from "@/components/application-status-badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Stats {
  counts: {
    activeUsers: number;
    activePets: number;
    approvedApplications: number;
    pendingApplications: number;
  };
  recentApplications: Array<{
    id: number;
    status: string;
    // Add other application properties as needed
  }>;
}

export default function AdminDashboard() {
  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch admin stats");
      }
      return response.json();
    },
    staleTime: 60000,
  });

  const [statsState, setStatsState] = useState<Stats | null>(null);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard Overview</h1>
          
          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="ml-4">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>
                  <Skeleton className="mt-2 h-4 w-28" />
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Recent applications skeleton */}
          <Card className="mb-8">
            <div className="px-4 py-5 sm:px-6 border-b">
              <h2 className="text-lg font-medium text-gray-900">Recent Foster Applications</h2>
              <p className="text-sm text-gray-500 mt-1">Applications submitted in the last 7 days</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pet
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[1, 2, 3].map((i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="ml-4">
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-16 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-24 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Skeleton className="h-4 w-16" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          {/* Charts skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <div className="px-4 py-5 sm:px-6 border-b">
                <h2 className="text-lg font-medium text-gray-900">Pet Distribution by Type</h2>
              </div>
              <div className="p-6 flex justify-center">
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            </Card>
            
            <Card>
              <div className="px-4 py-5 sm:px-6 border-b">
                <h2 className="text-lg font-medium text-gray-900">Application Status Trends</h2>
              </div>
              <div className="p-6 flex justify-center">
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            </Card>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard Overview</h1>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-blue-100 rounded-md">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.counts.activeUsers || 0}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-green-600">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>12% increase</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-red-100 rounded-md">
                  <PawPrint className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Active Pets</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.counts.activePets || 0}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-green-600">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>8% increase</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-green-100 rounded-md">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Approved Applications</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.counts.approvedApplications || 0}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-green-600">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>15% increase</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 p-3 bg-yellow-100 rounded-md">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Applications</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats?.counts.pendingApplications || 0}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-red-600">
                <ArrowDown className="h-4 w-4 mr-1" />
                <span>3% decrease</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent applications */}
        <Card className="mb-8">
          <div className="px-4 py-5 sm:px-6 border-b">
            <h2 className="text-lg font-medium text-gray-900">Recent Foster Applications</h2>
            <p className="text-sm text-gray-500 mt-1">Applications submitted in the last 7 days</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pet
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.recentApplications?.slice(0, 3).map((application: any) => (
                  <tr key={application.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${application.user.name}`} 
                            alt={application.user.name} 
                          />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{application.user.name}</div>
                          <div className="text-sm text-gray-500">{application.user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.pet.name}</div>
                      <div className="text-sm text-gray-500">{application.pet.breed}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{new Date(application.created_at).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">{new Date(application.created_at).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ApplicationStatusBadge status={application.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link href={`/admin/foster-applications#${application.id}`}>
                        <Button variant="link" className="text-primary hover:text-primary/80">
                          {application.status === "pending" ? "Review" : "View"}
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 flex items-center justify-between border-t sm:px-6">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">3</span> of <span className="font-medium">{stats?.recentApplications?.length || 0}</span> applications
            </div>
            <div className="flex-1 flex justify-end">
              <Link href="/admin/foster-applications">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </div>
        </Card>
        
        {/* Pet Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <div className="px-4 py-5 sm:px-6 border-b">
              <h2 className="text-lg font-medium text-gray-900">Pet Distribution by Type</h2>
            </div>
            <div className="p-6 flex justify-center">
              <div className="w-full h-64 rounded-lg bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-gray-400 mb-2 mx-auto" />
                  <p className="text-gray-500">Pet distribution chart placeholder</p>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="px-4 py-5 sm:px-6 border-b">
              <h2 className="text-lg font-medium text-gray-900">Application Status Trends</h2>
            </div>
            <div className="p-6 flex justify-center">
              <div className="w-full h-64 rounded-lg bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <BarChart className="h-12 w-12 text-gray-400 mb-2 mx-auto" />
                  <p className="text-gray-500">Application trends chart placeholder</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
