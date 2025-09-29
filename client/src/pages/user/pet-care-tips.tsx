import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import UserLayout from "@/components/layouts/user-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  PawPrint,
  Dog,
  Cat,
  FilePlus,
  Book,
  Heart,
  Leaf,
  Apple,
  Wind,
  Droplets,
  Sun,
  Home,
  HelpCircle
} from "lucide-react";

type PetCareTip = {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  petType: string;
  icon: string;
};

interface CmsData {
  content: string | any[];
}

export default function PetCareTips() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPetType, setSelectedPetType] = useState("all");
  const [expandedTipId, setExpandedTipId] = useState<string | null>(null);

  // Fetch pet care tips from CMS
  const { data: cmsData } = useQuery<CmsData>({
    queryKey: ["/api/cms/pet-care-tips"],
  });

  // Parse the pet care tips or use fallback data
  let tipsList: any[] = [];
  if (cmsData?.content) {
    if (typeof cmsData.content === 'string') {
      try {
        const parsed = JSON.parse(cmsData.content);
        tipsList = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Failed to parse CMS content:', e);
      }
    } else if (Array.isArray(cmsData.content)) {
      tipsList = cmsData.content;
    }
  }

  // Use fallback data if no tips are available from CMS
  if (tipsList.length === 0) {
    tipsList = [
      {
        id: "1",
        title: "Preparing Your Home for a New Pet",
        description: "Learn how to pet-proof your home and create a safe environment for your new furry friend.",
        content: "When bringing a new pet home, it's important to ensure your space is safe and comfortable for them. Remove hazardous items from accessible areas, secure loose wires, and store chemicals safely. Create a designated space for your pet with their bed, toys, and necessary supplies. For dogs, make sure your yard is secure with proper fencing. For cats, consider providing scratching posts and vertical spaces. Take time to gradually introduce your pet to different parts of your home to help them adjust comfortably.",
        category: "housing",
        petType: "all",
        icon: "Home"
      },
      {
        id: "2",
        title: "Nutrition Guide: What to Feed Your Pet",
        description: "A comprehensive guide to pet nutrition, including what foods to avoid and recommended diets.",
        content: "Proper nutrition is crucial for your pet's health. For dogs, a balanced diet should include high-quality protein, carbohydrates, healthy fats, vitamins, and minerals. For cats, focus on high protein, moderate fat, and low carbohydrate foods. Always provide fresh water, and avoid feeding pets chocolate, onions, grapes, raisins, and xylitol as these are toxic. Consider your pet's age, size, and activity level when determining portion sizes. Consult with your veterinarian about specific dietary needs, especially for pets with health conditions.",
        category: "nutrition",
        petType: "all",
        icon: "Apple"
      },
      {
        id: "3",
        title: "Basic Dog Training Tips",
        description: "Start with these fundamental training techniques to establish good behavior in your dog.",
        content: "Training your dog establishes boundaries and builds a strong bond. Begin with basic commands like sit, stay, come, and down. Use positive reinforcement – reward good behavior with treats, praise, or play. Keep training sessions short (5-10 minutes) but consistent. Use clear, single-word commands and be patient. Socialize your dog early by exposing them to different people, environments, and other animals. Address unwanted behaviors immediately but never use physical punishment. Consider professional training classes for additional guidance and socialization opportunities.",
        category: "training",
        petType: "dog",
        icon: "Dog"
      },
      {
        id: "4",
        title: "Understanding Cat Behavior",
        description: "Learn to interpret your cat's body language and vocalizations to better meet their needs.",
        content: "Cats communicate primarily through body language and vocalizations. A cat with a tall, straight tail is usually happy, while a puffed tail indicates fear or aggression. Purring typically signals contentment but can also indicate stress in certain contexts. Kneading ('making biscuits') shows comfort and contentment. Respecting your cat's space is important – let them come to you for interaction. Provide vertical spaces for security and observation. Multiple litter boxes, scratching posts, and toys are essential for their well-being. Regular play sessions help prevent behavior problems and strengthen your bond.",
        category: "behavior",
        petType: "cat",
        icon: "Cat"
      },
      {
        id: "5",
        title: "Seasonal Pet Care: Summer Safety",
        description: "Protect your pet from heat-related issues during the warmer months with these important tips.",
        content: "Hot weather poses several risks to pets. Never leave pets in parked cars, even for a short time, as temperatures can rise quickly to dangerous levels. Provide ample shade and fresh water when outdoors. Limit exercise to cooler morning or evening hours to prevent heat exhaustion. Be aware of hot pavement that can burn paw pads. Watch for signs of overheating: excessive panting, drooling, lethargy, vomiting. Consider pet-safe sunscreen for animals with thin hair or pink skin. Keep pools fenced or supervised, as not all pets are strong swimmers. During summer celebrations, keep pets away from fireworks, citronella products, and certain picnic foods.",
        category: "seasonal",
        petType: "all",
        icon: "Sun"
      },
      {
        id: "6",
        title: "Grooming Essentials for Long-haired Breeds",
        description: "Maintain your long-haired pet's coat with these grooming techniques and schedules.",
        content: "Long-haired breeds require regular grooming to prevent matting and maintain skin health. Brush your pet several times a week using appropriate tools like slicker brushes, combs, or de-shedding tools. Pay special attention to areas prone to tangling: behind ears, under legs, and tail area. Regular baths with pet-specific shampoo help keep the coat clean, but avoid over-bathing which can dry out skin. Trim hair around eyes, paws, and sanitary areas regularly. Professional grooming every 6-8 weeks is recommended for many long-haired breeds. During grooming sessions, check for skin issues, parasites, or abnormalities that might require veterinary attention.",
        category: "grooming",
        petType: "all",
        icon: "Wind"
      }
    ];
  }

  // Filter tips based on selected category and pet type
  const filteredTips = tipsList.filter(tip => {
    const categoryMatch = selectedCategory === "all" || tip.category === selectedCategory;
    const petTypeMatch = selectedPetType === "all" || tip.petType === "all" || tip.petType === selectedPetType;
    return categoryMatch && petTypeMatch;
  });

  // Get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Dog": return <Dog />;
      case "Cat": return <Cat />;
      case "PawPrint": return <PawPrint />;
      case "Heart": return <Heart />;
      case "Book": return <Book />;
      case "Leaf": return <Leaf />;
      case "Apple": return <Apple />;
      case "Wind": return <Wind />;
      case "Droplets": return <Droplets />;
      case "Sun": return <Sun />;
      case "Home": return <Home />;
      default: return <HelpCircle />;
    }
  };

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(tipsList.map(tip => tip.category)))];

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Pet Care Tips</h1>
            <p className="text-gray-600">Learn how to provide the best care for your fostered pets</p>
          </div>
        </div>

        {cmsData?.content ? (
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Tips</CardTitle>
                <CardDescription>Filter pet care tips by category and pet type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Pet Type</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant={selectedPetType === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPetType("all")}
                    >
                      <PawPrint className="mr-1 h-4 w-4" />
                      All Pets
                    </Button>
                    <Button 
                      variant={selectedPetType === "dog" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPetType("dog")}
                    >
                      <Dog className="mr-1 h-4 w-4" />
                      Dogs
                    </Button>
                    <Button 
                      variant={selectedPetType === "cat" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPetType("cat")}
                    >
                      <Cat className="mr-1 h-4 w-4" />
                      Cats
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Tips Grid */}
            {filteredTips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTips.map((tip) => (
                  <Card key={tip.id}>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-full">
                          {getIconComponent(tip.icon)}
                        </div>
                        <CardTitle className="text-lg">{tip.title}</CardTitle>
                      </div>
                      <CardDescription>{tip.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {expandedTipId === tip.id ? (
                        <div className="text-sm text-gray-600 whitespace-pre-line">
                          {tip.content}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600 line-clamp-3">
                          {tip.content}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="ghost"
                        onClick={() => setExpandedTipId(expandedTipId === tip.id ? null : tip.id)}
                      >
                        {expandedTipId === tip.id ? "Show Less" : "Read More"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <FilePlus className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No tips found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  No pet care tips matching your current filters
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedPetType("all");
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
            
            {/* Additional Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Resources</CardTitle>
                <CardDescription>More resources to help you care for your fostered pet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Book className="h-5 w-5 text-primary mr-2" />
                      <h3 className="text-sm font-medium">Recommended Reading</h3>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside ml-1">
                      <li>The Complete Guide to Pet Health</li>
                      <li>Understanding Animal Behavior</li>
                      <li>First Aid for Pets</li>
                      <li>Positive Training Techniques</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Heart className="h-5 w-5 text-primary mr-2" />
                      <h3 className="text-sm font-medium">Veterinary Services</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      As a foster parent, veterinary services for your fostered pet are covered by our shelter. Call our emergency line at (555) 123-4567 for urgent care needs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-72" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-5 w-40" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-24" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
