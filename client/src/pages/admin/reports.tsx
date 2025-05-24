import { useState } from "react";
import AdminLayout from "@/components/layouts/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  DownloadIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  TrendingUp,
  UserCheck,
  PawPrint,
  Calendar,
  FileText
} from "lucide-react";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Reports() {
  const [reportType, setReportType] = useState("adoption");
  
  // Fetch dashboard stats which include aggregated data for reports
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/dashboard-stats"],
    staleTime: 60000,
  });

  // Sample chart data based on the fetched stats
  const getPetDistributionData = () => {
    if (!stats?.petStatsByType) {
      return [
        { name: 'Dogs', value: 65 },
        { name: 'Cats', value: 45 },
        { name: 'Other', value: 12 }
      ];
    }
    
    return stats.petStatsByType.map((stat: any) => ({
      name: stat.type.charAt(0).toUpperCase() + stat.type.slice(1),
      value: Number(stat.count)
    }));
  };
  
  const getApplicationStatusData = () => {
    if (!stats?.statusTrends) {
      return [
        { name: 'Pending', count: 32 },
        { name: 'Approved', count: 28 },
        { name: 'Rejected', count: 14 }
      ];
    }
    
    return stats.statusTrends.map((trend: any) => ({
      name: trend.status.charAt(0).toUpperCase() + trend.status.slice(1),
      count: Number(trend.count)
    }));
  };
  
  const getMonthlyAdoptionData = () => {
    // Mocked monthly adoption data, in a real scenario this would come from the API
    return [
      { name: 'Jan', adoptions: 4 },
      { name: 'Feb', adoptions: 6 },
      { name: 'Mar', adoptions: 10 },
      { name: 'Apr', adoptions: 8 },
      { name: 'May', adoptions: 12 },
      { name: 'Jun', adoptions: 9 },
    ];
  };
  
  const getApplicationConversionData = () => {
    // Mocked application conversion data (applications to approvals)
    return [
      { name: 'Jan', applications: 10, approvals: 4 },
      { name: 'Feb', applications: 15, approvals: 6 },
      { name: 'Mar', applications: 20, approvals: 10 },
      { name: 'Apr', applications: 25, approvals: 8 },
      { name: 'May', applications: 30, approvals: 12 },
      { name: 'Jun', applications: 22, approvals: 9 },
    ];
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600">Analytical insights into the fostering program</p>
          </div>
          <Button className="mt-4 sm:mt-0" variant="outline" onClick={() => console.log("Download report")}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>

        <div className="mb-6">
          <Tabs defaultValue="adoption" onValueChange={setReportType}>
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
              <TabsTrigger value="adoption">Adoption Stats</TabsTrigger>
              <TabsTrigger value="applications">Application Trends</TabsTrigger>
              <TabsTrigger value="pets">Pet Distribution</TabsTrigger>
              <TabsTrigger value="users">User Analytics</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Skeleton className="h-full w-full" />
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <>
            {/* Adoption Stats Content */}
            {reportType === "adoption" && (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Monthly Adoption Trends</CardTitle>
                    <CardDescription>
                      Number of pets adopted per month over the last 6 months
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getMonthlyAdoptionData()}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="adoptions" fill="#4F46E5" name="Adoptions" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-full">
                          <PawPrint className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="font-medium">Total Adoptions</div>
                      </div>
                      <div className="mt-4 text-3xl font-bold">49</div>
                      <div className="mt-1 text-sm text-green-600 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        18% increase from last month
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <UserCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="font-medium">Active Fosters</div>
                      </div>
                      <div className="mt-4 text-3xl font-bold">28</div>
                      <div className="mt-1 text-sm text-green-600 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        12% increase from last month
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Calendar className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="font-medium">Average Time to Adoption</div>
                      </div>
                      <div className="mt-4 text-3xl font-bold">32 days</div>
                      <div className="mt-1 text-sm text-red-600 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1 rotate-180" />
                        5% increase from last month
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Most Popular Breeds</CardTitle>
                    <CardDescription>
                      Breed popularity based on adoption frequency
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          layout="vertical"
                          data={[
                            { name: 'Golden Retriever', value: 12 },
                            { name: 'Labrador', value: 9 },
                            { name: 'Siamese Cat', value: 8 },
                            { name: 'Maine Coon', value: 7 },
                            { name: 'Beagle', value: 6 },
                            { name: 'Tabby Cat', value: 4 },
                            { name: 'German Shepherd', value: 3 }
                          ]}
                          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                        >
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip />
                          <Bar dataKey="value" fill="#FF6B6B" name="Adoptions" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Application Trends Content */}
            {reportType === "applications" && (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Application Conversion Rates</CardTitle>
                    <CardDescription>
                      Comparison of applications submitted vs. approved over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={getApplicationConversionData()}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="applications" fill="#8884d8" name="Applications" />
                          <Bar dataKey="approvals" fill="#4F46E5" name="Approvals" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Application Status Distribution</CardTitle>
                      <CardDescription>
                        Breakdown of current application statuses
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getApplicationStatusData()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                            >
                              {getApplicationStatusData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Application Response Time</CardTitle>
                      <CardDescription>
                        Average time to respond to applications (days)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: 'Jan', days: 3.2 },
                              { name: 'Feb', days: 2.8 },
                              { name: 'Mar', days: 2.5 },
                              { name: 'Apr', days: 2.2 },
                              { name: 'May', days: 1.8 },
                              { name: 'Jun', days: 1.5 }
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="days" fill="#10B981" name="Days" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Common Application Rejection Reasons</CardTitle>
                    <CardDescription>
                      Analysis of why applications are rejected
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Inadequate Housing', value: 35 },
                              { name: 'Insufficient Experience', value: 25 },
                              { name: 'Incompatible Schedule', value: 20 },
                              { name: 'Already Has Multiple Pets', value: 15 },
                              { name: 'Other', value: 5 }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getApplicationStatusData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Pet Distribution Content */}
            {reportType === "pets" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pet Type Distribution</CardTitle>
                      <CardDescription>
                        Breakdown of pets by type in the system
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getPetDistributionData()}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {getPetDistributionData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Pet Status Distribution</CardTitle>
                      <CardDescription>
                        Breakdown of pets by current status
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Available', value: 42 },
                                { name: 'Fostered', value: 28 },
                                { name: 'Adopted', value: 30 }
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {[
                                { name: 'Available', value: 42, color: '#4ADE80' },
                                { name: 'Fostered', value: 28, color: '#60A5FA' },
                                { name: 'Adopted', value: 30, color: '#A78BFA' }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Pet Age Distribution</CardTitle>
                    <CardDescription>
                      Number of pets by age group in the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: '<1 Year', count: 15 },
                            { name: '1-2 Years', count: 28 },
                            { name: '3-5 Years', count: 35 },
                            { name: '6-8 Years', count: 12 },
                            { name: '9+ Years', count: 8 }
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#FF6B6B" name="Number of Pets" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Average Time in System</CardTitle>
                    <CardDescription>
                      Average days pets spend in the system before being fostered/adopted
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Dogs (Small)', days: 28 },
                            { name: 'Dogs (Medium)', days: 35 },
                            { name: 'Dogs (Large)', days: 45 },
                            { name: 'Cats (Young)', days: 22 },
                            { name: 'Cats (Adult)', days: 38 },
                            { name: 'Other Pets', days: 52 }
                          ]}
                          margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                          layout="vertical"
                        >
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" />
                          <Tooltip />
                          <Bar dataKey="days" fill="#4F46E5" name="Average Days" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* User Analytics Content */}
            {reportType === "users" && (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>User Growth Over Time</CardTitle>
                    <CardDescription>
                      Number of new user registrations per month
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Jan', count: 12 },
                            { name: 'Feb', count: 19 },
                            { name: 'Mar', count: 25 },
                            { name: 'Apr', count: 18 },
                            { name: 'May', count: 29 },
                            { name: 'Jun', count: 34 }
                          ]}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#4F46E5" name="New Users" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>User Role Distribution</CardTitle>
                      <CardDescription>
                        Breakdown of users by role in the system
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Regular Users', value: 85 },
                                { name: 'Admins', value: 15 }
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              <Cell fill="#4F46E5" />
                              <Cell fill="#10B981" />
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>User Engagement</CardTitle>
                      <CardDescription>
                        Frequency of user actions in the system
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: 'Login', count: 450 },
                              { name: 'Browse Pets', count: 380 },
                              { name: 'Apply', count: 120 },
                              { name: 'Check Status', count: 200 },
                              { name: 'View Tips', count: 150 }
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#FF6B6B" name="Actions" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>User Application Conversion Rate</CardTitle>
                    <CardDescription>
                      Percentage of users who browse vs. apply for fostering
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-full">
                              <UserCheck className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="font-medium">Total Visitors</div>
                          </div>
                          <div className="mt-4 text-3xl font-bold">1,245</div>
                          <div className="mt-1 text-sm text-green-600 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            15% increase from last month
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-green-100 rounded-full">
                              <FileText className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="font-medium">Applications</div>
                          </div>
                          <div className="mt-4 text-3xl font-bold">320</div>
                          <div className="mt-1 text-sm text-green-600 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            22% increase from last month
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-purple-100 rounded-full">
                              <BarChartIcon className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="font-medium">Conversion Rate</div>
                          </div>
                          <div className="mt-4 text-3xl font-bold">25.7%</div>
                          <div className="mt-1 text-sm text-green-600 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            3.2% increase from last month
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
