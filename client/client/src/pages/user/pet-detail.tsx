import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import UserLayout from "@/components/layouts/user-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Pet, FosterApplication } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Heart,
  Calendar,
  MapPin,
  PawPrint,
  Cake,
  Info,
  AlertCircle,
  ClipboardList,
} from "lucide-react";

export default function PetDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [applicationNotes, setApplicationNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch pet details
  const { data: pet, isLoading } = useQuery<Pet>({
    queryKey: [`/api/pets/${id}`],
    staleTime: 60000,
  });

  // Fetch user's applications for this pet
  const { data: userApplications } = useQuery<FosterApplication[]>({
    queryKey: ["/api/my-applications"],
    staleTime: 60000,
  });

  const hasApplied = userApplications?.some(app => app.pet_id === Number(id));

  // Submit foster application
  const fosterMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/foster-applications", {
        pet_id: Number(id),
        notes: applicationNotes,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Application submitted",
        description: "Your fostering application has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-applications"] });
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Application failed",
        description: error.message || "Could not submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <UserLayout>
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-6 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/4 mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="md:col-span-2">
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <Skeleton className="h-5 w-32 mb-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32 mb-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </UserLayout>
    );
  }

  if (!pet) {
    return (
      <UserLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Pet not found</h3>
          <p className="mt-2 text-sm text-gray-500">
            The pet you're looking for doesn't exist or has been removed.
          </p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => navigate("/browse-pets")}
          >
            Browse available pets
          </Button>
        </div>
      </UserLayout>
    );
  }

  const handleApplyForFoster = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to apply for fostering.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    setIsDialogOpen(true);
  };

  const submitApplication = () => {
    if (!applicationNotes.trim()) {
      toast({
        title: "Application incomplete",
        description: "Please provide some notes about why you'd like to foster this pet.",
        variant: "destructive",
      });
      return;
    }
    fosterMutation.mutate();
  };

  // Fallback image if no image_url is provided
  const imageUrl = pet.image_url || 
    `https://api.dicebear.com/7.x/lorelei/svg?seed=${pet.name}&backgroundColor=ffadad,ffd6a5,fdffb6,caffbf,9bf6ff,a0c4ff,bdb2ff&backgroundType=solid`;

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
        <p className="text-lg text-gray-600 mb-6">{pet.breed} · {pet.gender === "male" ? "Male" : "Female"}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <img 
              src={imageUrl} 
              alt={`${pet.name} the ${pet.breed}`}
              className="w-full h-auto rounded-lg shadow-md object-cover aspect-video"
            />
            <div className="flex flex-wrap gap-2 mt-4">
              {(pet.traits as string[]).map((trait, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {pet.status === "available" ? "Available for Foster" : 
                   pet.status === "fostered" ? "Currently Fostered" : "Adopted"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 py-2">
                <div className="flex items-center text-sm text-gray-600">
                  <PawPrint className="mr-2 h-4 w-4" />
                  <span>Type: {pet.type.charAt(0).toUpperCase() + pet.type.slice(1)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Cake className="mr-2 h-4 w-4" />
                  <span>Age: {pet.age} {pet.age === 1 ? 'year' : 'years'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>Shelter ID: {pet.shelter_id || "Not specified"}</span>
                </div>
              </CardContent>
              <CardFooter>
                {pet.status === "available" ? (
                  hasApplied ? (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate("/my-applications")}
                    >
                      <ClipboardList className="mr-2 h-4 w-4" />
                      View Your Application
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={handleApplyForFoster}>
                      <Heart className="mr-2 h-4 w-4" />
                      Apply to Foster
                    </Button>
                  )
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Not Available for Fostering
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
        
        <Tabs defaultValue="about">
          <TabsList className="mb-4">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="care">Care Requirements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About {pet.name}</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p>{pet.description}</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="care">
            <Card>
              <CardHeader>
                <CardTitle>Care Requirements</CardTitle>
                <CardDescription>What you need to know about caring for {pet.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Info className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Diet</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {pet.type === "dog" ? 
                        "High-quality dog food appropriate for their age and size. Fresh water should always be available." :
                       pet.type === "cat" ? 
                        "Balanced cat food with proper protein levels. Ensure fresh water is always available." :
                        "Specialized food appropriate for this type of pet. Consult with a veterinarian for specific dietary needs."}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Info className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Exercise</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {pet.type === "dog" ? 
                        "Regular walks and playtime, at least 30-60 minutes of activity daily depending on age and breed." :
                       pet.type === "cat" ? 
                        "Interactive toys and play sessions to keep them mentally and physically active." :
                        "Regular exercise appropriate for this type of pet. Research specific requirements for their species."}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <Info className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">Health Monitoring</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      Regular vet check-ups are required. Watch for changes in appetite, energy levels, or behavior.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Apply to Foster Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply to Foster {pet.name}</DialogTitle>
            <DialogDescription>
              Please provide some additional information about why you'd like to foster {pet.name}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Why would you like to foster this pet?
              </label>
              <Textarea
                id="notes"
                placeholder="Tell us about your experience with pets, your living situation, and why you're interested in fostering..."
                value={applicationNotes}
                onChange={(e) => setApplicationNotes(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={submitApplication} 
              disabled={fosterMutation.isPending}
            >
              {fosterMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
}
