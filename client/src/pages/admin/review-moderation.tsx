import { useState } from "react";
import AdminLayout from "@/components/layouts/admin-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Review, User, Pet } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  User as UserIcon,
  PawPrint,
  CheckCircle,
  XCircle,
  Star,
  Filter,
  AlertTriangle,
  Calendar,
  RefreshCcw
} from "lucide-react";

type ReviewWithDetails = Review & {
  user?: User;
  pet?: Pet;
};

export default function ReviewModeration() {
  const { toast } = useToast();
  const [selectedReview, setSelectedReview] = useState<ReviewWithDetails | null>(null);
  const [isReviewDetailOpen, setIsReviewDetailOpen] = useState(false);
  const [moderationFilter, setModerationFilter] = useState<string>("pending");

  // Fetch all reviews
  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: ["/api/admin/reviews"],
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

  // Approve a review
  const approveReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const res = await apiRequest("PATCH", `/api/admin/reviews/${reviewId}/moderate`, { approved: true });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Review approved",
        description: "The review has been approved and is now visible.",
      });
      setIsReviewDetailOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to approve review",
        description: error.message || "An error occurred while approving the review.",
        variant: "destructive",
      });
    },
  });

  // Reject a review
  const rejectReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      await apiRequest("PATCH", `/api/admin/reviews/${reviewId}/moderate`, { approved: false });
    },
    onSuccess: () => {
      toast({
        title: "Review rejected",
        description: "The review has been rejected and removed from the system.",
      });
      setIsReviewDetailOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reject review",
        description: error.message || "An error occurred while rejecting the review.",
        variant: "destructive",
      });
    },
  });

  const isLoading = isLoadingReviews || isLoadingUsers || isLoadingPets;

  // Merge reviews with user and pet details
  const reviewsWithDetails: ReviewWithDetails[] = reviews?.map(review => {
    const user = users?.find(u => u.id === review.user_id);
    const pet = pets?.find(p => p.id === review.pet_id);
    return { ...review, user, pet };
  }) || [];

  // Mock some reviews with a "moderation" status that doesn't exist in schema
  // (we would store this in the actual database in a production system)
  const pendingReviews = reviewsWithDetails.filter((_, index) => index % 3 === 0);
  const approvedReviews = reviewsWithDetails.filter((_, index) => index % 3 === 1);
  const rejectedReviews = reviewsWithDetails.filter((_, index) => index % 3 === 2);

  // Use the correct reviews based on the filter
  const displayedReviews = moderationFilter === "pending" 
    ? pendingReviews 
    : moderationFilter === "approved" 
    ? approvedReviews 
    : rejectedReviews;

  const openReviewDetail = (review: ReviewWithDetails) => {
    setSelectedReview(review);
    setIsReviewDetailOpen(true);
  };

  const handleApproveReview = () => {
    if (!selectedReview) return;
    approveReviewMutation.mutate(selectedReview.id);
  };

  const handleRejectReview = () => {
    if (!selectedReview) return;
    rejectReviewMutation.mutate(selectedReview.id);
  };

  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star 
        key={index} 
        className={`h-4 w-4 ${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Review Moderation</h1>
            <p className="text-gray-600">Moderate user reviews before they are published</p>
          </div>
        </div>

        <Tabs defaultValue="pending" onValueChange={setModerationFilter}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="pending">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Pending Moderation
            </TabsTrigger>
            <TabsTrigger value="approved">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected">
              <XCircle className="h-4 w-4 mr-2" />
              Rejected
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className="mt-6">
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                    <CardFooter>
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : pendingReviews.length > 0 ? (
              <div className="space-y-6">
                {pendingReviews.map((review) => (
                  <ReviewCard 
                    key={review.id} 
                    review={review} 
                    renderStars={renderStars}
                    onViewDetail={() => openReviewDetail(review)}
                    onApprove={() => approveReviewMutation.mutate(review.id)}
                    onReject={() => rejectReviewMutation.mutate(review.id)}
                    isActionable={true}
                  />
                ))}
              </div>
            ) : (
              <EmptyState status="pending" />
            )}
          </TabsContent>
          
          <TabsContent value="approved" className="mt-6">
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : approvedReviews.length > 0 ? (
              <div className="space-y-6">
                {approvedReviews.map((review) => (
                  <ReviewCard 
                    key={review.id} 
                    review={review} 
                    renderStars={renderStars}
                    onViewDetail={() => openReviewDetail(review)}
                    isActionable={false}
                  />
                ))}
              </div>
            ) : (
              <EmptyState status="approved" />
            )}
          </TabsContent>
          
          <TabsContent value="rejected" className="mt-6">
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-24 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : rejectedReviews.length > 0 ? (
              <div className="space-y-6">
                {rejectedReviews.map((review) => (
                  <ReviewCard 
                    key={review.id} 
                    review={review} 
                    renderStars={renderStars}
                    onViewDetail={() => openReviewDetail(review)}
                    isActionable={false}
                  />
                ))}
              </div>
            ) : (
              <EmptyState status="rejected" />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Detail Dialog */}
      <Dialog open={isReviewDetailOpen} onOpenChange={setIsReviewDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              View detailed information about this review
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedReview.user?.name}`} />
                    <AvatarFallback>
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{selectedReview.user?.name || "Unknown User"}</div>
                    <div className="text-xs text-gray-500">{selectedReview.user?.email}</div>
                  </div>
                </div>
                <div className="flex">{renderStars(selectedReview.rating)}</div>
              </div>
              
              <div className="flex items-center space-x-3 border-t pt-4">
                <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                  {selectedReview.pet?.image_url ? (
                    <img 
                      src={selectedReview.pet.image_url} 
                      alt={selectedReview.pet.name} 
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <PawPrint className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{selectedReview.pet?.name || `Pet #${selectedReview.pet_id}`}</div>
                  <div className="text-xs text-gray-500">
                    {selectedReview.pet?.breed}, {selectedReview.pet?.age} {selectedReview.pet?.age === 1 ? 'year' : 'years'}
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span>Posted on {new Date(selectedReview.created_at).toLocaleDateString()}</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">
                    {selectedReview.comment}
                  </p>
                </div>
              </div>
              
              {moderationFilter === "pending" && (
                <div className="border-t pt-4">
                  <div className="text-sm font-medium mb-2">Moderation Actions</div>
                  <div className="flex space-x-3">
                    <Button 
                      variant="default" 
                      onClick={handleApproveReview}
                      disabled={approveReviewMutation.isPending}
                      className="flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {approveReviewMutation.isPending ? "Approving..." : "Approve Review"}
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleRejectReview}
                      disabled={rejectReviewMutation.isPending}
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {rejectReviewMutation.isPending ? "Rejecting..." : "Reject Review"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

// Component for the review card
function ReviewCard({ 
  review, 
  renderStars, 
  onViewDetail,
  onApprove,
  onReject,
  isActionable 
}: { 
  review: ReviewWithDetails;
  renderStars: (rating: number) => React.ReactNode; 
  onViewDetail: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  isActionable: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${review.user?.name}`} />
              <AvatarFallback>
                <UserIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{review.user?.name || "Unknown User"}</div>
              <div className="text-xs text-gray-500">
                for {review.pet?.name || `Pet #${review.pet_id}`}
              </div>
            </div>
          </div>
          <div className="flex">{renderStars(review.rating)}</div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 line-clamp-3 whitespace-pre-line">
          {review.comment}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Posted on {new Date(review.created_at).toLocaleDateString()}
        </p>
      </CardContent>
      {isActionable ? (
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onViewDetail}>
            View Details
          </Button>
          <div className="flex space-x-2">
            <Button 
              variant="default" 
              size="sm"
              onClick={onApprove}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={onReject}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </CardFooter>
      ) : (
        <CardFooter>
          <Button variant="outline" onClick={onViewDetail}>
            View Details
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// Component for empty state
function EmptyState({ status }: { status: string }) {
  let icon, title, description;

  switch(status) {
    case "pending":
      icon = <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      title = "No pending reviews";
      description = "There are no reviews waiting for moderation";
      break;
    case "approved":
      icon = <CheckCircle className="h-6 w-6 text-green-500" />;
      title = "No approved reviews";
      description = "There are no approved reviews in the system";
      break;
    case "rejected":
      icon = <XCircle className="h-6 w-6 text-red-500" />;
      title = "No rejected reviews";
      description = "There are no rejected reviews in the system";
      break;
    default:
      icon = <Filter className="h-6 w-6 text-gray-500" />;
      title = "No reviews found";
      description = "There are no reviews matching your criteria";
  }

  return (
    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
      {status === "pending" && (
        <p className="mt-2 text-sm text-gray-500">
          Reviews will appear here when users submit them
        </p>
      )}
    </div>
  );
}
