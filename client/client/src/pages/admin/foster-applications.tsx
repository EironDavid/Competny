import { useState } from "react";
import AdminLayout from "@/components/layouts/admin-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FosterApplication, Pet, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import ApplicationStatusBadge from "@/components/application-status-badge";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Search,
  CalendarIcon,
  CheckCircle,
  XCircle,
  ClipboardList,
  UserIcon,
  PawPrint,
  Clock,
  FileText,
  MoreHorizontal,
  AlertCircle,
  RefreshCcw
} from "lucide-react";

type ApplicationWithDetails = FosterApplication & {
  user?: User;
  pet?: Pet;
};

export default function FosterApplications() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Fetch all applications
  const { data: applications, isLoading: isLoadingApplications } = useQuery<FosterApplication[]>({
    queryKey: ["/api/admin/foster-applications"],
    staleTime: 60000,
  });

  // Fetch all users
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    staleTime: 300000,
  });

  // Fetch all pets
  const { data: pets, isLoading: isLoadingPets } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
    staleTime: 300000,
  });

  // Update application status mutation
  const updateApplicationMutation = useMutation({
    mutationFn: async ({ 
      applicationId, 
      status, 
      notes, 
      scheduledVisit 
    }: { 
      applicationId: number; 
      status: string; 
      notes: string; 
      scheduledVisit?: Date;
    }) => {
      const res = await apiRequest("PATCH", `/api/admin/foster-applications/${applicationId}`, {
        status,
        notes,
        scheduled_visit: scheduledVisit
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Application updated",
        description: "The application status has been updated successfully.",
      });
      setIsReviewDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/foster-applications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update application",
        description: error.message || "An error occurred while updating the application.",
        variant: "destructive",
      });
    },
  });

  const isLoading = isLoadingApplications || isLoadingUsers || isLoadingPets;

  // Merge applications with user and pet details
  const applicationsWithDetails: ApplicationWithDetails[] = applications?.map(application => {
    const user = users?.find(u => u.id === application.user_id);
    const pet = pets?.find(p => p.id === application.pet_id);
    return { ...application, user, pet };
  }) || [];

  // Filter applications based on search term and status
  const filteredApplications = applicationsWithDetails.filter(application => {
    const matchesSearch = !searchTerm || 
      application.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.pet?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.pet?.breed.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || application.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Group applications by status
  const pendingApplications = filteredApplications.filter(app => app.status === "pending");
  const approvedApplications = filteredApplications.filter(app => app.status === "approved");
  const rejectedApplications = filteredApplications.filter(app => app.status === "rejected");

  const openReviewDialog = (application: ApplicationWithDetails) => {
    setSelectedApplication(application);
    setStatusUpdate(application.status);
    setNotes(application.notes || "");
    setScheduledDate(application.scheduled_visit ? new Date(application.scheduled_visit) : undefined);
    setIsReviewDialogOpen(true);
  };

  const handleUpdateApplication = () => {
    if (!selectedApplication) return;
    
    updateApplicationMutation.mutate({
      applicationId: selectedApplication.id,
      status: statusUpdate,
      notes,
      scheduledVisit: scheduledDate
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter(undefined);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Foster Applications</h1>
            <p className="text-gray-600">Manage and respond to fostering applications</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filter Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by user, pet..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          {(searchTerm || statusFilter) && (
            <CardFooter className="border-t pt-6">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </CardFooter>
          )}
        </Card>

        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-36" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full mb-4" />
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all">All ({filteredApplications.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingApplications.length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({approvedApplications.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedApplications.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <ApplicationsTable 
                applications={filteredApplications} 
                openReviewDialog={openReviewDialog} 
              />
            </TabsContent>
            
            <TabsContent value="pending" className="mt-6">
              {pendingApplications.length > 0 ? (
                <ApplicationsTable 
                  applications={pendingApplications} 
                  openReviewDialog={openReviewDialog} 
                />
              ) : (
                <EmptyState status="pending" />
              )}
            </TabsContent>
            
            <TabsContent value="approved" className="mt-6">
              {approvedApplications.length > 0 ? (
                <ApplicationsTable 
                  applications={approvedApplications} 
                  openReviewDialog={openReviewDialog} 
                />
              ) : (
                <EmptyState status="approved" />
              )}
            </TabsContent>
            
            <TabsContent value="rejected" className="mt-6">
              {rejectedApplications.length > 0 ? (
                <ApplicationsTable 
                  applications={rejectedApplications} 
                  openReviewDialog={openReviewDialog} 
                />
              ) : (
                <EmptyState status="rejected" />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Application Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
            <DialogDescription>
              Review and update the status of this application
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              {/* Application Details */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-500">Applicant</div>
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedApplication.user?.name}`} />
                      <AvatarFallback>
                        <UserIcon className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{selectedApplication.user?.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">{selectedApplication.user?.email}</div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm font-medium text-gray-500">Pet</div>
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-md bg-gray-100 flex items-center justify-center mr-2">
                      {selectedApplication.pet?.image_url ? (
                        <img 
                          src={selectedApplication.pet.image_url} 
                          alt={selectedApplication.pet.name} 
                          className="h-6 w-6 rounded-md object-cover"
                        />
                      ) : (
                        <PawPrint className="h-3 w-3 text-gray-400" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{selectedApplication.pet?.name}</span>
                  </div>
                  <div className="text-xs text-gray-500">{selectedApplication.pet?.breed}, {selectedApplication.pet?.age} {selectedApplication.pet?.age === 1 ? 'year' : 'years'}</div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="text-sm font-medium text-gray-500 mb-2">Application Notes</div>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {selectedApplication.notes || "No notes provided with this application."}
                </p>
              </div>
              
              <div className="border-t pt-4">
                <div className="text-sm font-medium text-gray-500 mb-2">Update Status</div>
                <Select
                  value={statusUpdate}
                  onValueChange={setStatusUpdate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {statusUpdate === "approved" && (
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">Schedule Visit (optional)</div>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate ? format(scheduledDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={(date) => {
                          setScheduledDate(date);
                          setIsCalendarOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
              
              <div>
                <div className="text-sm font-medium text-gray-500 mb-2">Additional Notes</div>
                <Textarea
                  placeholder="Add notes or feedback for the applicant..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateApplication}
              disabled={updateApplicationMutation.isPending}
            >
              {updateApplicationMutation.isPending ? "Updating..." : "Update Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// Component for the applications table
function ApplicationsTable({ 
  applications, 
  openReviewDialog 
}: { 
  applications: ApplicationWithDetails[]; 
  openReviewDialog: (application: ApplicationWithDetails) => void;
}) {
  if (applications.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <ClipboardList className="h-6 w-6 text-gray-600" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No applications found</h3>
        <p className="mt-2 text-sm text-gray-500">
          No matching applications found with the current filters
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Pet</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled Visit</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${application.user?.name}`} />
                        <AvatarFallback>
                          <UserIcon className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{application.user?.name || "Unknown"}</div>
                        <div className="text-xs text-gray-500">{application.user?.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                        {application.pet?.image_url ? (
                          <img 
                            src={application.pet.image_url} 
                            alt={application.pet.name} 
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        ) : (
                          <PawPrint className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{application.pet?.name || `Pet #${application.pet_id}`}</div>
                        <div className="text-xs text-gray-500">
                          {application.pet?.breed}, {application.pet?.age} {application.pet?.age === 1 ? 'year' : 'years'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{new Date(application.created_at).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{new Date(application.created_at).toLocaleTimeString()}</div>
                  </TableCell>
                  <TableCell>
                    <ApplicationStatusBadge status={application.status as any} />
                  </TableCell>
                  <TableCell>
                    {application.scheduled_visit ? (
                      new Date(application.scheduled_visit).toLocaleDateString()
                    ) : (
                      <span className="text-gray-500 text-xs">Not scheduled</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openReviewDialog(application)}
                    >
                      {application.status === "pending" ? "Review" : "View"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// Component for empty state
function EmptyState({ status }: { status: string }) {
  let icon, title, description;

  switch(status) {
    case "pending":
      icon = <Clock className="h-6 w-6 text-yellow-500" />;
      title = "No pending applications";
      description = "There are no pending applications to review";
      break;
    case "approved":
      icon = <CheckCircle className="h-6 w-6 text-green-500" />;
      title = "No approved applications";
      description = "There are no approved applications";
      break;
    case "rejected":
      icon = <XCircle className="h-6 w-6 text-red-500" />;
      title = "No rejected applications";
      description = "There are no rejected applications";
      break;
    default:
      icon = <AlertCircle className="h-6 w-6 text-gray-500" />;
      title = "No applications found";
      description = "There are no applications matching your criteria";
  }

  return (
    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}
