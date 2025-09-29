import { useState, useEffect } from "react";
import AdminLayout from "@/components/layouts/admin-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CmsPage, insertCmsPageSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PlusCircle,
  FileEdit,
  Trash2,
  Eye,
  MoreHorizontal,
  FilePlus,
  File,
  CalendarDays
} from "lucide-react";

const cmsFormSchema = insertCmsPageSchema.pick({
  title: true,
  content: true,
  slug: true
});

const petCareTipSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  content: z.string(),
  category: z.string(),
  petType: z.string(),
  icon: z.string()
});

const petCareTipsFormSchema = z.object({
  title: z.string(),
  slug: z.string(),
  tips: z.array(petCareTipSchema)
});

type CmsFormValues = z.infer<typeof cmsFormSchema>;
type PetCareTipsFormValues = z.infer<typeof petCareTipsFormSchema>;

export default function Cms() {
  const { toast } = useToast();
  const [isAddPageOpen, setIsAddPageOpen] = useState(false);
  const [isEditPageOpen, setIsEditPageOpen] = useState(false);
  const [isPreviewPageOpen, setIsPreviewPageOpen] = useState(false);
  const [isPetCareTipsOpen, setIsPetCareTipsOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<CmsPage | null>(null);

  // Fetch all CMS pages
  const { data: pages, isLoading } = useQuery<CmsPage[]>({
    queryKey: ["/api/admin/cms-pages"],
    staleTime: 60000,
  });

  // Auto-create pet care tips page if it doesn't exist or has invalid content
  const initializePetCareTips = async () => {
    const petCareTipsPage = pages?.find(page => page.slug === "pet-care-tips");
    if (!petCareTipsPage || 
        (petCareTipsPage.title.includes("Test") || petCareTipsPage.title.includes("Hello"))) {
      
      const defaultTipsData = {
        title: "Pet Care Tips",
        slug: "pet-care-tips",
        content: JSON.stringify(getDefaultTips())
      };

      try {
        if (petCareTipsPage) {
          // Update existing page
          await apiRequest("PATCH", `/api/admin/cms-pages/${petCareTipsPage.id}`, defaultTipsData);
        } else {
          // Create new page
          await apiRequest("POST", "/api/admin/cms-pages", defaultTipsData);
        }
        
        queryClient.invalidateQueries({ queryKey: ["/api/admin/cms-pages"] });
        queryClient.invalidateQueries({ queryKey: ["/api/cms-pages/pet-care-tips"] });
        
        toast({
          title: "Pet Care Tips Initialized",
          description: "Pet care tips page has been set up with default content.",
        });
      } catch (error) {
        console.error("Error initializing pet care tips:", error);
      }
    }
  };

  // Initialize pet care tips when pages are loaded
  useEffect(() => {
    if (pages && !isLoading) {
      const petCareTipsPage = pages.find(page => page.slug === "pet-care-tips");
      if (!petCareTipsPage || 
          petCareTipsPage.title.includes("Test") || 
          petCareTipsPage.title.includes("Hello") ||
          petCareTipsPage.content.includes("Pet Care Test") ||
          petCareTipsPage.content.includes("hello world")) {
        initializePetCareTips();
      }
    }
  }, [pages, isLoading]);

  // Create page mutation
  const createPageMutation = useMutation({
    mutationFn: async (data: CmsFormValues) => {
      const res = await apiRequest("POST", "/api/admin/cms-pages", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Page created",
        description: "The page has been created successfully.",
      });
      setIsAddPageOpen(false);
      addPageForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cms-pages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms-pages/pet-care-tips"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create page",
        description: error.message || "An error occurred while creating the page.",
        variant: "destructive",
      });
    },
  });

  // Update page mutation
  const updatePageMutation = useMutation({
    mutationFn: async (data: CmsFormValues) => {
      if (!selectedPage) throw new Error("No page selected");
      const res = await apiRequest("PATCH", `/api/admin/cms-pages/${selectedPage.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Page updated",
        description: "The page has been updated successfully.",
      });
      setIsEditPageOpen(false);
      editPageForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cms-pages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms-pages/pet-care-tips"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update page",
        description: error.message || "An error occurred while updating the page.",
        variant: "destructive",
      });
    },
  });

  // Delete page mutation
  const deletePageMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/cms-pages/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Page deleted",
        description: "The page has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cms-pages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms-pages/pet-care-tips"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete page",
        description: error.message || "An error occurred while deleting the page.",
        variant: "destructive",
      });
    },
  });

  // Save pet care tips mutation
  const savePetCareTipsMutation = useMutation({
    mutationFn: async (data: PetCareTipsFormValues) => {
      // Check if page already exists
      const existingPage = pages?.find(page => page.slug === "pet-care-tips");
      
      if (existingPage) {
        // Update existing page
        const res = await apiRequest("PATCH", `/api/admin/cms-pages/${existingPage.id}`, {
          title: data.title,
          slug: data.slug,
          content: JSON.stringify(data.tips)
        });
        return await res.json();
      } else {
        // Create new page
        const res = await apiRequest("POST", "/api/admin/cms-pages", {
          title: data.title,
          slug: data.slug,
          content: JSON.stringify(data.tips)
        });
        return await res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "Pet care tips updated",
        description: "The pet care tips have been updated successfully.",
      });
      setIsPetCareTipsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cms-pages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cms-pages/pet-care-tips"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update pet care tips",
        description: error.message || "An error occurred while updating the pet care tips.",
        variant: "destructive",
      });
    },
  });

  // Add new page form
  const addPageForm = useForm<CmsFormValues>({
    resolver: zodResolver(cmsFormSchema),
    defaultValues: {
      title: "",
      content: "",
      slug: "",
    },
  });

  // Edit page form
  const editPageForm = useForm<CmsFormValues>({
    resolver: zodResolver(cmsFormSchema),
    defaultValues: {
      title: "",
      content: "",
      slug: "",
    },
  });

  // Pet care tips form
  const petCareTipsForm = useForm<PetCareTipsFormValues>({
    resolver: zodResolver(petCareTipsFormSchema),
    defaultValues: {
      title: "Pet Care Tips",
      slug: "pet-care-tips",
      tips: []
    },
  });

  const { fields: tipFields, append: appendTip, remove: removeTip } = useFieldArray({
    control: petCareTipsForm.control,
    name: "tips"
  });

  const handleAddPage = (data: CmsFormValues) => {
    createPageMutation.mutate(data);
  };

  const handleEditPage = (data: CmsFormValues) => {
    updatePageMutation.mutate(data);
  };

  const handleDeletePage = (id: number) => {
    if (confirm("Are you sure you want to delete this page? This action cannot be undone.")) {
      deletePageMutation.mutate(id);
    }
  };

  const openEditDialog = (page: CmsPage) => {
    setSelectedPage(page);
    editPageForm.reset({
      title: page.title,
      content: page.content,
      slug: page.slug,
    });
    setIsEditPageOpen(true);
  };

  const openPreviewDialog = (page: CmsPage) => {
    setSelectedPage(page);
    setIsPreviewPageOpen(true);
  };

  const openPetCareTipsEditor = () => {
    const petCareTipsPage = pages?.find(page => page.slug === "pet-care-tips");
    if (petCareTipsPage) {
      try {
        let tips = [];
        if (typeof petCareTipsPage.content === 'string') {
          // Try to parse JSON content
          try {
            tips = JSON.parse(petCareTipsPage.content);
          } catch {
            // If parsing fails, create default tips
            tips = [];
          }
        } else if (Array.isArray(petCareTipsPage.content)) {
          tips = petCareTipsPage.content;
        }
        
        petCareTipsForm.reset({
          title: petCareTipsPage.title,
          slug: petCareTipsPage.slug,
          tips: Array.isArray(tips) && tips.length > 0 ? tips : getDefaultTips()
        });
      } catch (error) {
        console.error("Error parsing pet care tips:", error);
        petCareTipsForm.reset({
          title: "Pet Care Tips",
          slug: "pet-care-tips",
          tips: getDefaultTips()
        });
      }
    } else {
      // Initialize with default tips if no page exists
      petCareTipsForm.reset({
        title: "Pet Care Tips",
        slug: "pet-care-tips",
        tips: getDefaultTips()
      });
    }
    setIsPetCareTipsOpen(true);
  };

  const getDefaultTips = () => [
    {
      id: "1",
      title: "Preparing Your Home for a New Pet",
      description: "Learn how to pet-proof your home and create a safe environment for your new furry friend.",
      content: "When bringing a new pet home, it's important to ensure your space is safe and comfortable for them. Remove hazardous items from accessible areas, secure loose wires, and store chemicals safely. Create a designated space for your pet with their bed, toys, and necessary supplies. For dogs, make sure your yard is secure with proper fencing. For cats, consider providing scratching posts and vertical spaces.",
      category: "housing",
      petType: "all",
      icon: "Home"
    },
    {
      id: "2",
      title: "Nutrition Guide: What to Feed Your Pet",
      description: "A comprehensive guide to pet nutrition, including what foods to avoid and recommended diets.",
      content: "Proper nutrition is crucial for your pet's health. For dogs, a balanced diet should include high-quality protein, carbohydrates, healthy fats, vitamins, and minerals. For cats, focus on high protein, moderate fat, and low carbohydrate foods. Always provide fresh water and avoid feeding pets chocolate, onions, grapes, raisins, and xylitol as these are toxic.",
      category: "nutrition",
      petType: "all",
      icon: "Apple"
    },
    {
      id: "3",
      title: "Basic Dog Training Tips",
      description: "Start with these fundamental training techniques to establish good behavior in your dog.",
      content: "Training your dog establishes boundaries and builds a strong bond. Begin with basic commands like sit, stay, come, and down. Use positive reinforcement – reward good behavior with treats, praise, or play. Keep training sessions short (5-10 minutes) but consistent.",
      category: "training",
      petType: "dog",
      icon: "Dog"
    },
    {
      id: "4",
      title: "Understanding Cat Behavior",
      description: "Learn to interpret your cat's body language and vocalizations to better meet their needs.",
      content: "Cats communicate primarily through body language and vocalizations. A cat with a tall, straight tail is usually happy, while a puffed tail indicates fear or aggression. Purring typically signals contentment but can also indicate stress in certain contexts.",
      category: "behavior",
      petType: "cat",
      icon: "Cat"
    }
  ];

  const handleSavePetCareTips = (data: PetCareTipsFormValues) => {
    savePetCareTipsMutation.mutate(data);
  };

  const addNewTip = () => {
    appendTip({
      id: Date.now().toString(),
      title: "",
      description: "",
      content: "",
      category: "general",
      petType: "all",
      icon: "PawPrint"
    });
  };

  // Filter out test pages and focus on valid content
  const cmsPages = (pages || []).filter(page => 
    page.slug === "pet-care-tips" || 
    (!page.title.toLowerCase().includes("test") && 
     !page.title.toLowerCase().includes("hello") &&
     !page.content.toLowerCase().includes("hello world"))
  );

  // Clean up invalid pages
  const cleanupInvalidPages = async () => {
    if (!pages) return;
    
    const invalidPages = pages.filter(page => 
      page.slug !== "pet-care-tips" && (
        page.title.toLowerCase().includes("test") || 
        page.title.toLowerCase().includes("hello") ||
        page.content.toLowerCase().includes("hello world") ||
        page.content.toLowerCase().includes("pet care test")
      )
    );

    for (const page of invalidPages) {
      try {
        await apiRequest("DELETE", `/api/admin/cms-pages/${page.id}`);
      } catch (error) {
        console.error("Error deleting invalid page:", error);
      }
    }

    if (invalidPages.length > 0) {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cms-pages"] });
      toast({
        title: "Cleanup Complete",
        description: `Removed ${invalidPages.length} invalid test pages.`,
      });
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Content Management</h1>
            <p className="text-gray-600">Manage website content and pages</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={cleanupInvalidPages}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clean Test Pages
            </Button>
            <Button variant="outline" onClick={openPetCareTipsEditor}>
              <FileEdit className="h-4 w-4 mr-2" />
              Edit Pet Care Tips
            </Button>
            <Button onClick={() => setIsAddPageOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Page
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>CMS Pages</CardTitle>
            <CardDescription>
              Edit and manage content pages for the website
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : cmsPages.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cmsPages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <File className="h-5 w-5 text-gray-500" />
                            <span>{page.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>{page.slug}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-gray-500" />
                            <span>{new Date(page.updated_at).toLocaleDateString()}</span>
                          </div>
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
                              <DropdownMenuItem onClick={() => openEditDialog(page)}>
                                <FileEdit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openPreviewDialog(page)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeletePage(page.id)}
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
                  <FilePlus className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No pages found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Start by creating your first CMS page
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsAddPageOpen(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add New Page
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add New Page Dialog */}
      <Dialog open={isAddPageOpen} onOpenChange={setIsAddPageOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Page</DialogTitle>
            <DialogDescription>
              Create a new content page for the website
            </DialogDescription>
          </DialogHeader>
          <Form {...addPageForm}>
            <form onSubmit={addPageForm.handleSubmit(handleAddPage)} className="space-y-4">
              <FormField
                control={addPageForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Page title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addPageForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="page-url-slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={addPageForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={
                          addPageForm.watch("slug") === "pet-care-tips" 
                            ? `For pet care tips, use JSON format:
[
  {
    "id": "1",
    "title": "Tip Title",
    "description": "Short description",
    "content": "Full tip content",
    "category": "nutrition",
    "petType": "all",
    "icon": "Apple"
  }
]` 
                            : "Page content..."
                        }
                        rows={10}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddPageOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPageMutation.isPending}>
                  {createPageMutation.isPending ? "Creating..." : "Create Page"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Page Dialog */}
      <Dialog open={isEditPageOpen} onOpenChange={setIsEditPageOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Page</DialogTitle>
            <DialogDescription>
              Update content for {selectedPage?.title}
            </DialogDescription>
          </DialogHeader>
          <Form {...editPageForm}>
            <form onSubmit={editPageForm.handleSubmit(handleEditPage)} className="space-y-4">
              <FormField
                control={editPageForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Page title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editPageForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="page-url-slug" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editPageForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Page content..." 
                        rows={10}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditPageOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePageMutation.isPending}>
                  {updatePageMutation.isPending ? "Updating..." : "Update Page"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Preview Page Dialog */}
      <Dialog open={isPreviewPageOpen} onOpenChange={setIsPreviewPageOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPage?.title}</DialogTitle>
            <DialogDescription>
              Preview of how the content will appear
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 border rounded-lg p-6 bg-white">
            <div className="prose prose-sm max-w-none">
              {selectedPage?.content && (
                <div dangerouslySetInnerHTML={{ __html: 
                  selectedPage.content.startsWith('[') 
                    ? `<h2>Structured Content</h2><p>This page contains structured JSON data that is displayed differently on the frontend.</p>` 
                    : selectedPage.content.replace(/\n/g, '<br />') 
                }} />
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewPageOpen(false)}>
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pet Care Tips Editor Dialog */}
      <Dialog open={isPetCareTipsOpen} onOpenChange={setIsPetCareTipsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pet Care Tips</DialogTitle>
            <DialogDescription>
              Manage the pet care tips content that appears on the website
            </DialogDescription>
          </DialogHeader>
          
          <Form {...petCareTipsForm}>
            <form onSubmit={petCareTipsForm.handleSubmit(handleSavePetCareTips)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={petCareTipsForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={petCareTipsForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Page Slug</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Pet Care Tips</h3>
                  <Button type="button" variant="outline" onClick={addNewTip}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add New Tip
                  </Button>
                </div>
                
                {tipFields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Tip #{index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTip(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={petCareTipsForm.control}
                          name={`tips.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Tip title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={petCareTipsForm.control}
                          name={`tips.${index}.category`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="general">General</SelectItem>
                                  <SelectItem value="nutrition">Nutrition</SelectItem>
                                  <SelectItem value="training">Training</SelectItem>
                                  <SelectItem value="health">Health</SelectItem>
                                  <SelectItem value="behavior">Behavior</SelectItem>
                                  <SelectItem value="grooming">Grooming</SelectItem>
                                  <SelectItem value="housing">Housing</SelectItem>
                                  <SelectItem value="seasonal">Seasonal</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={petCareTipsForm.control}
                          name={`tips.${index}.petType`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pet Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select pet type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="all">All Pets</SelectItem>
                                  <SelectItem value="dog">Dogs</SelectItem>
                                  <SelectItem value="cat">Cats</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={petCareTipsForm.control}
                          name={`tips.${index}.icon`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Icon</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select icon" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="PawPrint">Paw Print</SelectItem>
                                  <SelectItem value="Dog">Dog</SelectItem>
                                  <SelectItem value="Cat">Cat</SelectItem>
                                  <SelectItem value="Heart">Heart</SelectItem>
                                  <SelectItem value="Apple">Apple</SelectItem>
                                  <SelectItem value="Home">Home</SelectItem>
                                  <SelectItem value="Sun">Sun</SelectItem>
                                  <SelectItem value="Wind">Wind</SelectItem>
                                  <SelectItem value="Book">Book</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={petCareTipsForm.control}
                        name={`tips.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Short Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Brief description of the tip" 
                                rows={2}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={petCareTipsForm.control}
                        name={`tips.${index}.content`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Content</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Detailed tip content" 
                                rows={4}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
                
                {tipFields.length === 0 && (
                  <div className="text-center py-12 border rounded-lg border-dashed">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <FilePlus className="h-6 w-6 text-gray-600" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No tips yet</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Add your first pet care tip to get started
                    </p>
                    <Button 
                      type="button"
                      variant="outline" 
                      className="mt-4"
                      onClick={addNewTip}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add New Tip
                    </Button>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPetCareTipsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={savePetCareTipsMutation.isPending}>
                  {savePetCareTipsMutation.isPending ? "Saving..." : "Save Pet Care Tips"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
