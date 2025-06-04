import { useState } from "react";
import AdminLayout from "@/components/layouts/admin-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Pet, insertPetSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
  DialogTrigger,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MoreHorizontal,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  PawPrint,
  RefreshCcw,
  AlertCircle
} from "lucide-react";

// Extended schema for the form with validation
const petFormSchema = insertPetSchema.extend({
  traits: z.string().transform((val) => val.split(',').map(t => t.trim())),
}).omit({ id: true });

type PetFormValues = z.infer<typeof petFormSchema>;

export default function PetManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [isEditPetOpen, setIsEditPetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [petTypeFilter, setPetTypeFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // Fetch all pets
  const { data: pets, isLoading } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
    staleTime: 60000,
  });

  // Create a new pet
  const createPetMutation = useMutation({
    mutationFn: async (data: PetFormValues) => {
      const res = await apiRequest("POST", "/api/admin/pets", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Pet created",
        description: "The pet has been added successfully.",
      });
      setIsAddPetOpen(false);
      addPetForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create pet",
        description: error.message || "An error occurred while adding the pet.",
        variant: "destructive",
      });
    },
  });

  // Update an existing pet
  const updatePetMutation = useMutation({
    mutationFn: async ({ petId, data }: { petId: number; data: Partial<Pet> }) => {
      const res = await apiRequest("PATCH", `/api/admin/pets/${petId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Pet updated",
        description: "The pet has been updated successfully.",
      });
      setIsEditPetOpen(false);
      editPetForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update pet",
        description: error.message || "An error occurred while updating the pet.",
        variant: "destructive",
      });
    },
  });

  // Delete a pet
  const deletePetMutation = useMutation({
    mutationFn: async (petId: number) => {
      await apiRequest("DELETE", `/api/admin/pets/${petId}`);
    },
    onSuccess: () => {
      toast({
        title: "Pet deleted",
        description: "The pet has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedPet(null);
      queryClient.invalidateQueries({ queryKey: ["/api/pets"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete pet",
        description: error.message || "An error occurred while deleting the pet.",
        variant: "destructive",
      });
    },
  });

  // Add pet form
  const addPetForm = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: "",
      breed: "",
      type: "dog",
      age: 1,
      gender: "male",
      description: "",
      status: "available",
      traits: [],
      image_url: "",
    },
  });

  // Edit pet form
  const editPetForm = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: "",
      breed: "",
      type: "dog",
      age: 1,
      gender: "male",
      description: "",
      status: "available",
      traits: [],
      image_url: "",
    },
  });

  // Filter pets based on search term and filters
  const filteredPets = pets?.filter((pet) => {
    // Apply search filter
    const matchesSearch = !searchTerm || 
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply type filter
    const matchesType = !petTypeFilter || pet.type === petTypeFilter;
    
    // Apply status filter
    const matchesStatus = !statusFilter || pet.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddPet = (data: PetFormValues) => {
    createPetMutation.mutate(data);
  };

  const handleEditPet = (data: PetFormValues) => {
    if (!selectedPet) return;
    updatePetMutation.mutate({ petId: selectedPet.id, data });
  };

  const handleDeletePet = () => {
    if (!selectedPet) return;
    deletePetMutation.mutate(selectedPet.id);
  };

  const openEditDialog = (pet: Pet) => {
    setSelectedPet(pet);
    // Set form default values based on the selected pet
    editPetForm.reset({
      name: pet.name,
      breed: pet.breed,
      type: pet.type,
      age: pet.age,
      gender: pet.gender,
      description: pet.description,
      status: pet.status,
      traits: (pet.traits as string[]).join(', '),
      image_url: pet.image_url || "",
      shelter_id: pet.shelter_id,
    });
    setIsEditPetOpen(true);
  };

  const openDeleteDialog = (pet: Pet) => {
    setSelectedPet(pet);
    setIsDeleteDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPetTypeFilter(undefined);
    setStatusFilter(undefined);
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Pet Management</h1>
            <p className="text-gray-600">Add, edit, and remove pets from the system</p>
          </div>
          <Button onClick={() => setIsAddPetOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Pet
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Filter Pets</CardTitle>
            <CardDescription>
              Use the filters below to find specific pets
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
                value={petTypeFilter}
                onValueChange={(value) => setPetTypeFilter(value || undefined)}
              >
                <SelectTrigger>
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
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="fostered">Fostered</SelectItem>
                  <SelectItem value="adopted">Adopted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          {(searchTerm || petTypeFilter || statusFilter) && (
            <CardFooter className="border-t pt-6">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </CardFooter>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pet List</CardTitle>
            <CardDescription>
              {filteredPets 
                ? `Showing ${filteredPets.length} of ${pets?.length} pets` 
                : "Loading pets..."}
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
            ) : filteredPets && filteredPets.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pet</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPets.map((pet) => (
                      <TableRow key={pet.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center">
                              {pet.image_url ? (
                                <img 
                                  src={pet.image_url} 
                                  alt={pet.name} 
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                              ) : (
                                <PawPrint className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <div>{pet.name}</div>
                              <div className="text-xs text-gray-500">{pet.breed}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {pet.type.charAt(0).toUpperCase() + pet.type.slice(1)}
                        </TableCell>
                        <TableCell>
                          {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}
                        </TableCell>
                        <TableCell>{pet.age} {pet.age === 1 ? 'year' : 'years'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              pet.status === "available" 
                                ? "bg-green-100 text-green-800" 
                                : pet.status === "fostered" 
                                ? "bg-blue-100 text-blue-800" 
                                : "bg-purple-100 text-purple-800"
                            }
                          >
                            {pet.status.charAt(0).toUpperCase() + pet.status.slice(1)}
                          </Badge>
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
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.preventDefault();
                                  window.open(`/pet/${pet.id}`, '_blank');
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(pet)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => openDeleteDialog(pet)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <AlertCircle className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No pets found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  No pets match your search criteria
                </p>
                {(searchTerm || petTypeFilter || statusFilter) && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={clearFilters}
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Pet Dialog */}
      <Dialog open={isAddPetOpen} onOpenChange={setIsAddPetOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Pet</DialogTitle>
            <DialogDescription>
              Fill in the details to add a new pet to the system
            </DialogDescription>
          </DialogHeader>
          <Form {...addPetForm}>
            <form onSubmit={addPetForm.handleSubmit(handleAddPet)} className="space-y-4">
              <FormField
                control={addPetForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Pet name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addPetForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="dog">Dog</SelectItem>
                          <SelectItem value="cat">Cat</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addPetForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addPetForm.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          step="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addPetForm.control}
                  name="breed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breed</FormLabel>
                      <FormControl>
                        <Input placeholder="Breed" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={addPetForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the pet..." 
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addPetForm.control}
                name="traits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Traits</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Friendly, Energetic, Loyal (comma separated)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addPetForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="fostered">Fostered</SelectItem>
                        <SelectItem value="adopted">Adopted</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addPetForm.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="URL to pet image" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addPetForm.control}
                name="shelter_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shelter ID (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Shelter ID" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddPetOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPetMutation.isPending}>
                  {createPetMutation.isPending ? "Adding..." : "Add Pet"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Pet Dialog */}
      <Dialog open={isEditPetOpen} onOpenChange={setIsEditPetOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pet</DialogTitle>
            <DialogDescription>
              Update the details for {selectedPet?.name}
            </DialogDescription>
          </DialogHeader>
          <Form {...editPetForm}>
            <form onSubmit={editPetForm.handleSubmit(handleEditPet)} className="space-y-4">
              <FormField
                control={editPetForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Pet name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editPetForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="dog">Dog</SelectItem>
                          <SelectItem value="cat">Cat</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editPetForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editPetForm.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (years)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          step="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editPetForm.control}
                  name="breed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breed</FormLabel>
                      <FormControl>
                        <Input placeholder="Breed" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={editPetForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the pet..." 
                        rows={3}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editPetForm.control}
                name="traits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Traits</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Friendly, Energetic, Loyal (comma separated)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editPetForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="fostered">Fostered</SelectItem>
                        <SelectItem value="adopted">Adopted</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editPetForm.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="URL to pet image" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editPetForm.control}
                name="shelter_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shelter ID (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Shelter ID" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditPetOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePetMutation.isPending}>
                  {updatePetMutation.isPending ? "Updating..." : "Update Pet"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedPet?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePet}
              disabled={deletePetMutation.isPending}
            >
              {deletePetMutation.isPending ? "Deleting..." : "Delete Pet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
