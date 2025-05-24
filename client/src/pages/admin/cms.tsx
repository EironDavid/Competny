import { useState } from "react";
import AdminLayout from "@/components/layouts/admin-layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { CmsPage, insertCmsPageSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

type CmsFormValues = z.infer<typeof cmsFormSchema>;

export default function Cms() {
  const { toast } = useToast();
  const [isAddPageOpen, setIsAddPageOpen] = useState(false);
  const [isEditPageOpen, setIsEditPageOpen] = useState(false);
  const [isPreviewPageOpen, setIsPreviewPageOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<CmsPage | null>(null);

  // Fetch all CMS pages
  const { data: pages, isLoading } = useQuery<CmsPage[]>({
    queryKey: ["/api/admin/cms-pages"],
    // Mock endpoint for now - would need to be implemented on the backend
    enabled: false, // Disable until endpoint is available
  });

  // Create or update CMS page
  const savePageMutation = useMutation({
    mutationFn: async (data: CmsFormValues) => {
      const res = await apiRequest("POST", "/api/admin/cms-pages", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: isEditPageOpen ? "Page updated" : "Page created",
        description: isEditPageOpen 
          ? "The page has been updated successfully." 
          : "The page has been created successfully.",
      });
      setIsAddPageOpen(false);
      setIsEditPageOpen(false);
      addPageForm.reset();
      editPageForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/cms-pages"] });
    },
    onError: (error: Error) => {
      toast({
        title: isEditPageOpen ? "Failed to update page" : "Failed to create page",
        description: error.message || "An error occurred while saving the page.",
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

  const handleAddPage = (data: CmsFormValues) => {
    savePageMutation.mutate(data);
  };

  const handleEditPage = (data: CmsFormValues) => {
    savePageMutation.mutate(data);
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

  // Mock CMS pages data until backend implementation is complete
  const mockPages: CmsPage[] = [
    {
      id: 1,
      title: "Pet Care Tips",
      content: JSON.stringify([
        {
          id: "1",
          title: "Preparing Your Home for a New Pet",
          description: "Learn how to pet-proof your home and create a safe environment for your new furry friend.",
          content: "When bringing a new pet home, it's important to ensure your space is safe and comfortable for them.",
          category: "housing",
          petType: "all",
          icon: "Home"
        },
        {
          id: "2",
          title: "Nutrition Guide: What to Feed Your Pet",
          description: "A comprehensive guide to pet nutrition, including what foods to avoid and recommended diets.",
          content: "Proper nutrition is crucial for your pet's health.",
          category: "nutrition",
          petType: "all",
          icon: "Apple"
        }
      ]),
      slug: "pet-care-tips",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      title: "About Us",
      content: "Competny is a dedicated foster management system designed to connect loving temporary homes with animals in need. Our mission is to provide the best possible care for pets awaiting their forever homes by placing them in nurturing foster environments.",
      slug: "about-us",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      title: "Fostering FAQ",
      content: "Frequently Asked Questions about fostering pets with Competny. Learn about the requirements, process, and benefits of becoming a foster parent.",
      slug: "fostering-faq",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ];

  const cmsPages = pages || mockPages;

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Content Management</h1>
            <p className="text-gray-600">Manage website content and pages</p>
          </div>
          <Button onClick={() => setIsAddPageOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Page
          </Button>
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
                              <DropdownMenuItem className="text-red-600">
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
                <Button type="button" variant="outline" onClick={() => setIsAddPageOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={savePageMutation.isPending}>
                  {savePageMutation.isPending ? "Creating..." : "Create Page"}
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
                <Button type="submit" disabled={savePageMutation.isPending}>
                  {savePageMutation.isPending ? "Updating..." : "Update Page"}
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
    </AdminLayout>
  );
}
