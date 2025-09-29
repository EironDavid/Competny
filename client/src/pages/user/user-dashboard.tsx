import { useEffect } from "react";
import UserLayout from "@/components/layouts/user-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PawPrint, ClipboardList, School } from "lucide-react";
import PetCard from "@/components/pet-card";
import ApplicationStatusBadge from "@/components/application-status-badge";
import { Pet, FosterApplication } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

interface CmsData {
  content: string | any[];
}

export default function UserDashboard() {
  const { user } = useAuth();

  // Fetch user applications
  const { data: applications, isLoading: isLoadingApplications } = useQuery<FosterApplication[]>({
    queryKey: ["/api/my-applications"],
    staleTime: 60000,
  });

  // Fetch recommended pets
  const { data: pets, isLoading: isLoadingPets } = useQuery<Pet[]>({
    queryKey: ["/api/pets", { status: "available" }],
    staleTime: 60000,
  });

  // Fetch pet care tips from CMS
  const { data: petCareTips } = useQuery<CmsData>({
    queryKey: ["/api/cms/pet-care-tips"],
  });

  // Parse the pet care tips from CMS
  let tipsList: any[] = [];
  if (petCareTips?.content) {
    if (typeof petCareTips.content === 'string') {
      try {
        const parsed = JSON.parse(petCareTips.content);
        tipsList = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Failed to parse CMS content:', e);
      }
    } else if (Array.isArray(petCareTips.content)) {
      tipsList = petCareTips.content;
    }
  }

  // Use fallback tips if no tips are available from CMS
  if (tipsList.length === 0) {
    tipsList = [
      {
        title: "Regular Veterinary Check-ups",
        description: "Schedule annual wellness exams and keep vaccinations up to date."
      },
      {
        title: "Proper Nutrition",
        description: "Provide a balanced, high-quality diet appropriate for your pet's age and health."
      }
    ];
  }

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.name || 'Friend'}!</h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your pet fostering journey.</p>
          
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/browse-pets">
              <Button className="inline-flex items-center">
                <PawPrint className="mr-2 h-4 w-4" />
                Browse Available Pets
              </Button>
            </Link>
            <Link href="/my-applications">
              <Button variant="outline" className="inline-flex items-center">
                <ClipboardList className="mr-2 h-4 w-4" />
                My Applications
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Active Applications */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your Active Applications</h2>
          
          {isLoadingApplications ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="h-16 w-16 rounded-lg" />
                      <div className="ml-4 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : applications && applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((application) => (
                <div key={application.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center">
                      <img 
                        src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${application.pet_id}`}
                        alt="Pet" 
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                      <div className="ml-4">
                        <h3 className="text-base font-medium text-gray-900">Application #{application.id}</h3>
                        <p className="text-sm text-gray-500">
                          Applied on {new Date(application.created_at).toLocaleDateString()}
                        </p>
                        <div className="mt-1 flex items-center">
                          <ApplicationStatusBadge status={application.status as any} />
                          {application.scheduled_visit && (
                            <span className="ml-2 text-xs text-gray-500">
                              Visit scheduled: {new Date(application.scheduled_visit).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link href={`/my-applications#${application.id}`}>
                      <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium">
                        View Details
                      </Button>
                    </Link>
                  </div>
                  
                  {application.status === "approved" && (
                    <div className="mt-3 border-t pt-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Next steps:</span> {application.notes || "Schedule a pickup from the shelter."}
                      </p>
                      <Button size="sm" className="mt-2">
                        Schedule Pickup
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border rounded-lg">
              <p className="text-gray-500">You don't have any active applications yet.</p>
              <Link href="/browse-pets">
                <Button variant="link" className="text-primary hover:text-primary/80 mt-2">
                  Browse available pets
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Recommended Pets */}
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recommended Pets For You</h2>
        {isLoadingPets ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <div className="w-full h-48">
                  <Skeleton className="h-full w-full" />
                </div>
                <CardContent className="pt-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-16 w-full mb-3" />
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-9 w-full mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {pets?.slice(0, 3).map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}
        
        {/* Pet Care Tips */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Latest Pet Care Tips</h2>
          <div className="divide-y divide-gray-200">
            {tipsList.length > 0 ? (
              tipsList.slice(0, 2).map((tip: any, index: number) => (
                <div key={index} className="py-4 flex">
                  <div className="flex-shrink-0">
                    <span className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary">
                      <School className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-medium text-gray-900">{tip.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{tip.description}</p>
                    <Link href="/pet-care-tips">
                      <Button variant="link" className="mt-2 h-auto p-0 text-sm font-medium text-primary hover:text-primary/80">
                        Read more
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-4 flex">
                <div className="flex-shrink-0">
                  <span className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary">
                    <School className="h-6 w-6" />
                  </span>
                </div>
                <div className="ml-4">
                  <h3 className="text-base font-medium text-gray-900">Preparing Your Home for a New Pet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Learn how to pet-proof your home and create a safe environment for your new furry friend.
                  </p>
                  <Link href="/pet-care-tips">
                    <Button variant="link" className="mt-2 h-auto p-0 text-sm font-medium text-primary hover:text-primary/80">
                      Read more
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4">
            <Link href="/pet-care-tips">
              <Button variant="link" className="text-sm font-medium text-primary hover:text-primary/80 p-0">
                View all pet care tips →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
