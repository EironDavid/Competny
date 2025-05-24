import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import UserLayout from "@/components/layouts/user-layout";
import { useAuth } from "@/hooks/use-auth";
import { FosterApplication, Pet, Review } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
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
  AlertCircle,
  Star,
  StarHalf,
  Edit,
  PlusCircle
} from "lucide-react";

export default function Reviews() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");

  // Fetch user's approved applications to find pets they can review
  const { data: applications, isLoading: isLoadingApplications } = useQuery<FosterApplication[]>({
    queryKey: ["/api/my-applications"],
  });

  // Fetch all pets
  const { data: pets, isLoading: isLoadingPets } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
  });

  // Fetch user's reviews
  const { data: userReviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: ["/api/user-reviews"],
  });

  // Create a review
  const reviewMutation = useMutation({
    mutationFn: async (data: { pet_id: number; rating: number; comment: string }) => {
      const res = await apiRequest("POST", "/api/reviews", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      setIsReviewDialogOpen(false);
      setRating(5);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/user-reviews"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit review",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Get pets that user has fostered (from approved applications)
  const fosteredPets = applications
    ?.filter(app => app.status === "approved")
    .map(app => pets?.find(pet => pet.id === app.pet_id))
    .filter(Boolean) as Pet[] || [];
  
  // Combine user reviews with fostered pets data
  const petsWithReviewStatus = fosteredPets.map(pet => {
    const reviewed = userReviews?.some(review => review.pet_id === pet.id) || false;
    return { ...pet, reviewed };
  });

  const isLoading = isLoadingApplications || isLoadingPets || isLoadingReviews;

  const handleOpenReviewDialog = (pet: Pet) => {
    setSelectedPet(pet);
    setIsReviewDialogOpen(true);
  };

  const handleSubmitReview = () => {
    if (!selectedPet) return;
    
    reviewMutation.mutate({
      pet_id: selectedPet.id,
      rating,
      comment
    });
  };

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Reviews & Feedback</h1>
            <p className="text-gray-600">Share your experience with your fostered pets</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-center">
                        <Skeleton className="h-16 w-16 rounded-md" />
                        <div className="ml-3 space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="mt-3">
                        <Skeleton className="h-9 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-16 w-full mt-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pets available for review */}
            <Card>
              <CardHeader>
                <CardTitle>Available for Review</CardTitle>
                <CardDescription>Provide feedback on the pets you've fostered</CardDescription>
              </CardHeader>
              <CardContent>
                {petsWithReviewStatus.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {petsWithReviewStatus.map((pet) => (
                      <div key={pet.id} className="border rounded-lg p-4">
                        <div className="flex items-center">
                          <img 
                            src={pet.image_url || `https://api.dicebear.com/7.x/lorelei/svg?seed=${pet.name}`}
                            alt={pet.name}
                            className="h-16 w-16 rounded-md object-cover"
                          />
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-gray-900">{pet.name}</h3>
                            <p className="text-xs text-gray-500">{pet.breed}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Button 
                            variant={pet.reviewed ? "outline" : "default"}
                            size="sm"
                            className="w-full"
                            onClick={() => handleOpenReviewDialog(pet)}
                          >
                            {pet.reviewed ? (
                              <>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Review
                              </>
                            ) : (
                              <>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Write Review
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 border rounded-lg">
                    <AlertCircle className="h-8 w-8 text-gray-400 mx-auto" />
                    <h3 className="mt-3 text-sm font-medium text-gray-900">No pets available for review</h3>
                    <p className="mt-2 text-xs text-gray-500">
                      You don't have any approved foster applications yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* User's submitted reviews (would be populated from the API when endpoint is available) */}
            <Card>
              <CardHeader>
                <CardTitle>Your Reviews</CardTitle>
                <CardDescription>Reviews you've submitted for your fostered pets</CardDescription>
              </CardHeader>
              <CardContent>
                {userReviews && userReviews.length > 0 ? (
                  <div className="space-y-4">
                    {userReviews.map((review) => {
                      const reviewedPet = pets?.find(pet => pet.id === review.pet_id);
                      const isPending = !review.approved;
                      return (
                        <div key={review.id} className={`border rounded-lg p-4 ${isPending ? 'bg-gray-50' : ''}`}>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">
                                {reviewedPet?.name || `Pet #${review.pet_id}`}
                              </h3>
                              <p className="text-xs text-gray-500">
                                Reviewed on {new Date(review.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="mt-3 text-sm text-gray-600">
                            {review.comment}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 border rounded-lg">
                    <Star className="h-8 w-8 text-gray-400 mx-auto" />
                    <h3 className="mt-3 text-sm font-medium text-gray-900">No reviews submitted yet</h3>
                    <p className="mt-2 text-xs text-gray-500">
                      Your submitted reviews will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Review Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Review Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-gray-600">
                  <p>
                    Your feedback helps us improve our foster program and helps future foster parents. 
                    Please keep the following in mind when writing your review:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Be honest and specific about your experience</li>
                    <li>Include both positive aspects and challenges you faced</li>
                    <li>Focus on the pet's behavior, needs, and personality</li>
                    <li>Avoid sharing personal or sensitive information</li>
                    <li>Keep your review respectful and constructive</li>
                  </ul>
                  <p>
                    All reviews are subject to moderation to ensure they meet our community guidelines.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPet ? `Review ${selectedPet.name}` : 'Write a Review'}
            </DialogTitle>
            <DialogDescription>
              Share your experience fostering this pet to help future foster parents
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Rating</label>
              <div className="flex mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className="focus:outline-none"
                    onClick={() => setRating(i + 1)}
                  >
                    <Star 
                      className={`h-8 w-8 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="comment" className="text-sm font-medium">
                Your Review
              </label>
              <Textarea
                id="comment"
                placeholder="Share your experience fostering this pet..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1"
                rows={5}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReview}
              disabled={reviewMutation.isPending || !comment.trim()}
            >
              {reviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
}
