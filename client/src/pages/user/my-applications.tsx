import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import UserLayout from "@/components/layouts/user-layout";
import { FosterApplication, Pet } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ApplicationStatusBadge from "@/components/application-status-badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  ClipboardCheck,
  ClipboardList,
  FileText,
  AlertCircle
} from "lucide-react";

export default function MyApplications() {
  const [activeApplicationId, setActiveApplicationId] = useState<number | null>(null);

  // Get application ID from URL hash if any
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash && !isNaN(Number(hash))) {
      setActiveApplicationId(Number(hash));
    }
  }, []);

  // Fetch all applications for the current user
  const { data: applications, isLoading } = useQuery<FosterApplication[]>({
    queryKey: ["/api/my-applications"],
    staleTime: 60000,
  });

  // Fetch all pets to get details for each application
  const { data: pets } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
    staleTime: 300000,
  });

  // Get pet details for applications
  const getApplicationsWithPets = () => {
    if (!applications || !pets) return [];
    
    return applications.map(application => ({
      ...application,
      pet: pets.find(pet => pet.id === application.pet_id)
    }));
  };

  const applicationsPets = getApplicationsWithPets();
  
  // Filter applications by status
  const pending = applicationsPets.filter(app => app.status === "pending");
  const approved = applicationsPets.filter(app => app.status === "approved");
  const rejected = applicationsPets.filter(app => app.status === "rejected");

  // Get the active application details
  const activeApplication = activeApplicationId 
    ? applicationsPets.find(app => app.id === activeApplicationId) 
    : null;

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">My Applications</h1>
            <p className="text-gray-600">Track the status of your foster applications</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-64" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-center">
                        <Skeleton className="h-16 w-16 rounded-lg" />
                        <div className="ml-4 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Applications list */}
            <div className="lg:col-span-1">
              <Tabs defaultValue="all">
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
                  <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
                  <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4 space-y-3">
                  {applicationsPets.map(app => (
                    <ApplicationCard 
                      key={app.id} 
                      application={app} 
                      isActive={app.id === activeApplicationId}
                      onClick={() => setActiveApplicationId(app.id)}
                    />
                  ))}
                </TabsContent>
                
                <TabsContent value="pending" className="mt-4 space-y-3">
                  {pending.length > 0 ? (
                    pending.map(app => (
                      <ApplicationCard 
                        key={app.id} 
                        application={app} 
                        isActive={app.id === activeApplicationId}
                        onClick={() => setActiveApplicationId(app.id)}
                      />
                    ))
                  ) : (
                    <EmptyState status="pending" />
                  )}
                </TabsContent>
                
                <TabsContent value="approved" className="mt-4 space-y-3">
                  {approved.length > 0 ? (
                    approved.map(app => (
                      <ApplicationCard 
                        key={app.id} 
                        application={app} 
                        isActive={app.id === activeApplicationId}
                        onClick={() => setActiveApplicationId(app.id)}
                      />
                    ))
                  ) : (
                    <EmptyState status="approved" />
                  )}
                </TabsContent>
                
                <TabsContent value="rejected" className="mt-4 space-y-3">
                  {rejected.length > 0 ? (
                    rejected.map(app => (
                      <ApplicationCard 
                        key={app.id} 
                        application={app} 
                        isActive={app.id === activeApplicationId}
                        onClick={() => setActiveApplicationId(app.id)}
                      />
                    ))
                  ) : (
                    <EmptyState status="rejected" />
                  )}
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Application details */}
            <div className="lg:col-span-2">
              {activeApplication ? (
                <ApplicationDetails application={activeApplication} />
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <ClipboardList className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Select an application</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Select an application from the list to view its details
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <ClipboardList className="h-6 w-6 text-gray-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No applications yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                You haven't submitted any foster applications yet
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.href = "/browse-pets"}
              >
                Browse available pets
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </UserLayout>
  );
}

// Component for application card in the list
function ApplicationCard({ 
  application, 
  isActive, 
  onClick 
}: { 
  application: FosterApplication & { pet?: Pet }, 
  isActive: boolean, 
  onClick: () => void 
}) {
  const pet = application.pet;
  
  // Fallback image if no pet image is available
  const imageUrl = pet?.image_url || 
    `https://api.dicebear.com/7.x/lorelei/svg?seed=${pet?.name || 'pet'}`;
  
  return (
    <div 
      className={`border rounded-lg p-3 cursor-pointer transition-all hover:border-primary ${isActive ? 'border-primary bg-primary/5' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <img 
          src={imageUrl} 
          alt={pet?.name || 'Pet'} 
          className="h-16 w-16 rounded-lg object-cover"
        />
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {pet?.name || `Application #${application.id}`}
            </h3>
            <ApplicationStatusBadge status={application.status as any} className="ml-2" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Applied on {new Date(application.created_at).toLocaleDateString()}
          </p>
          {application.scheduled_visit && (
            <p className="text-xs flex items-center text-blue-600 mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              Visit: {new Date(application.scheduled_visit).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Component for empty state
function EmptyState({ status }: { status: string }) {
  return (
    <div className="border rounded-lg p-6 text-center">
      <p className="text-gray-500 text-sm">No {status} applications found</p>
    </div>
  );
}

// Component for application details
function ApplicationDetails({ application }: { application: FosterApplication & { pet?: Pet } }) {
  const pet = application.pet;
  
  // Fallback image if no pet image is available
  const imageUrl = pet?.image_url || 
    `https://api.dicebear.com/7.x/lorelei/svg?seed=${pet?.name || 'pet'}`;
  
  const statusMessages = {
    pending: {
      title: "Application is being reviewed",
      description: "Your application is currently under review by our team. We'll notify you once a decision has been made.",
      icon: <Clock className="h-6 w-6 text-yellow-500" />,
      color: "bg-yellow-100"
    },
    approved: {
      title: "Application approved!",
      description: "Congratulations! Your application has been approved. Please follow the next steps to arrange a pickup.",
      icon: <ClipboardCheck className="h-6 w-6 text-green-500" />,
      color: "bg-green-100"
    },
    rejected: {
      title: "Application not approved",
      description: "We're sorry, but your application wasn't approved at this time. Please check the notes for more information.",
      icon: <AlertCircle className="h-6 w-6 text-red-500" />,
      color: "bg-red-100"
    }
  };
  
  const statusInfo = statusMessages[application.status as keyof typeof statusMessages];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Details</CardTitle>
        <CardDescription>
          Application #{application.id} • Submitted on {new Date(application.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status banner */}
        <div className={`p-4 rounded-lg ${statusInfo.color}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {statusInfo.icon}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">{statusInfo.title}</h3>
              <p className="text-sm mt-1">{statusInfo.description}</p>
            </div>
          </div>
        </div>
        
        {/* Pet info */}
        {pet && (
          <div className="flex items-center p-4 border rounded-lg">
            <img 
              src={imageUrl} 
              alt={pet.name} 
              className="h-20 w-20 rounded-lg object-cover"
            />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{pet.name}</h3>
              <p className="text-sm text-gray-500">
                {pet.breed} • {pet.gender === "male" ? "Male" : "Female"} • {pet.age} {pet.age === 1 ? 'year' : 'years'} old
              </p>
              <a 
                href={`/pet/${pet.id}`} 
                className="text-sm text-primary hover:text-primary/80 mt-1 inline-block"
              >
                View pet details
              </a>
            </div>
          </div>
        )}
        
        {/* Application notes */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-3">
            <FileText className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Application Notes</h3>
          </div>
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {application.notes || "No additional notes provided for this application."}
          </p>
        </div>
        
        {/* Scheduled visit */}
        {application.scheduled_visit && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Calendar className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-sm font-medium text-gray-900">Scheduled Visit</h3>
            </div>
            <p className="text-sm text-gray-600">
              You have a scheduled visit on <span className="font-medium">{new Date(application.scheduled_visit).toLocaleDateString()}</span> at the shelter.
            </p>
            <div className="mt-3">
              <Button size="sm">
                Add to Calendar
              </Button>
            </div>
          </div>
        )}
        
        {/* Next steps for approved applications */}
        {application.status === "approved" && (
          <div className="border rounded-lg p-4 bg-green-50">
            <div className="flex items-center mb-3">
              <ClipboardCheck className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="text-sm font-medium text-gray-900">Next Steps</h3>
            </div>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside ml-1">
              <li>Prepare your home for your new foster pet</li>
              <li>Gather necessary supplies (food, bedding, toys)</li>
              <li>Schedule a pickup from the shelter</li>
              <li>Attend orientation (if required)</li>
            </ol>
            <div className="mt-4">
              <Button>
                Schedule Pickup
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
