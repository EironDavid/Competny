import { useState } from "react";
import AdminLayout from "@/components/layouts/admin-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  UserCog,
  Shield,
  UserCheck,
  UserX,
  User as UserIcon,
  RefreshCcw,
} from "lucide-react";

export default function UserManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);

  // Fetch all users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    staleTime: 60000,
  });

  // Update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}`, { role });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "User role updated",
        description: "The user's role has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user role",
        description: error.message || "An error occurred while updating the user's role.",
        variant: "destructive",
      });
    },
  });

  // Filter users based on search term
  const filteredUsers = users?.filter((user) => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  });

  const handleViewUserDetails = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };

  const handleUpdateRole = (userId: number, newRole: string) => {
    updateRoleMutation.mutate({ userId, newRole });
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage system users and their roles</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Users</CardTitle>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <CardDescription>
              {filteredUsers
                ? `Showing ${filteredUsers.length} of ${users?.length} users`
                : "Loading users..."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                            <AvatarFallback>
                              <UserIcon className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{user.name}</span>
                            <span className="text-xs text-gray-500">{user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "outline"}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewUserDetails(user)}>
                              <UserCog className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.role === "user" ? (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateRole(user.id, "admin")}
                                disabled={updateRoleMutation.isPending}
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Make Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateRole(user.id, "user")}
                                disabled={updateRoleMutation.isPending}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Make Regular User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <UserX className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  No users match your search criteria
                </p>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setSearchTerm("")}
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Reset Search
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User activity statistics card - this would be connected to actual data in a real implementation */}
        <Card>
          <CardHeader>
            <CardTitle>User Activity Overview</CardTitle>
            <CardDescription>
              Recent user activity and engagement statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500">Total Users</div>
                <div className="mt-1 text-3xl font-semibold">{users?.length || 0}</div>
                <div className="mt-1 text-xs text-green-600">↑ 12% from last month</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500">Active Users</div>
                <div className="mt-1 text-3xl font-semibold">{Math.floor((users?.length || 0) * 0.8)}</div>
                <div className="mt-1 text-xs text-green-600">↑ 5% from last month</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500">Admins</div>
                <div className="mt-1 text-3xl font-semibold">
                  {users?.filter(user => user.role === "admin").length || 0}
                </div>
                <div className="mt-1 text-xs text-gray-500">No change</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Details Dialog */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected user
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-2 pb-4 border-b">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedUser.name}`} />
                  <AvatarFallback className="text-lg">
                    {selectedUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-medium">{selectedUser.name}</h3>
                <Badge variant={selectedUser.role === "admin" ? "default" : "outline"}>
                  {selectedUser.role}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Username</div>
                  <div className="mt-1">{selectedUser.username}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Email</div>
                  <div className="mt-1">{selectedUser.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Joined</div>
                  <div className="mt-1">{new Date(selectedUser.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">ID</div>
                  <div className="mt-1">{selectedUser.id}</div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Actions</h4>
                <div className="flex gap-2">
                  {selectedUser.role === "user" ? (
                    <Button 
                      size="sm"
                      onClick={() => {
                        handleUpdateRole(selectedUser.id, "admin");
                        setIsUserDetailsOpen(false);
                      }}
                      disabled={updateRoleMutation.isPending}
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Make Admin
                    </Button>
                  ) : (
                    <Button 
                      size="sm"
                      onClick={() => {
                        handleUpdateRole(selectedUser.id, "user");
                        setIsUserDetailsOpen(false);
                      }}
                      disabled={updateRoleMutation.isPending}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Make Regular User
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
