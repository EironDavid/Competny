import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import UserLayout from "@/components/layouts/user-layout";
import PetCard from "@/components/pet-card";
import { Pet } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Search, Filter } from "lucide-react";

export default function BrowsePets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [petType, setPetType] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>("available");

  // Fetch pets with optional filters
  const { data: pets, isLoading } = useQuery<Pet[]>({
    queryKey: ["/api/pets", { type: petType, status }],
    staleTime: 60000,
  });

  const filteredPets = pets?.filter(pet => {
    if (searchTerm) {
      const searchLowerCase = searchTerm.toLowerCase();
      return (
        pet.name.toLowerCase().includes(searchLowerCase) ||
        pet.breed.toLowerCase().includes(searchLowerCase) ||
        pet.description.toLowerCase().includes(searchLowerCase)
      );
    }
    return true;
  });

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Browse Pets</h1>
            <p className="text-gray-600">Find your perfect companion to foster</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filter Pets</CardTitle>
            <CardDescription>
              Use the filters below to find the perfect match
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name, breed..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                value={petType}
                onValueChange={(value) => setPetType(value || undefined)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pet Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="dog">Dogs</SelectItem>
                  <SelectItem value="cat">Cats</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value || undefined)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="fostered">Currently Fostered</SelectItem>
                  <SelectItem value="adopted">Adopted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        ) : filteredPets && filteredPets.length > 0 ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Found {filteredPets.length} {filteredPets.length === 1 ? "pet" : "pets"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Filter className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No pets found</h3>
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
