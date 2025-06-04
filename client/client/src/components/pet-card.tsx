import { Pet } from "@shared/schema";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface PetCardProps {
  pet: Pet;
}

export default function PetCard({ pet }: PetCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // Fallback image if no image_url is provided
  const imageUrl = pet.image_url || 
    `https://api.dicebear.com/7.x/initials/svg?seed=${pet.name}&backgroundColor=ffadad,ffd6a5,fdffb6,caffbf,9bf6ff,a0c4ff,bdb2ff&backgroundType=solid`;

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative">
        <img 
          src={imageUrl} 
          alt={`${pet.name} the ${pet.breed}`} 
          className="w-full h-48 object-cover"
        />
        <button 
          className={`absolute top-2 right-2 p-1.5 rounded-full ${
            isFavorite 
              ? "bg-white text-red-500" 
              : "bg-white/80 text-gray-400 hover:text-red-500"
          }`}
          onClick={toggleFavorite}
        >
          <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      <CardContent className="pt-4 flex-grow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{pet.name}</h3>
            <p className="text-sm text-gray-500">{pet.breed}, {pet.gender}, {pet.age} {pet.age === 1 ? 'year' : 'years'}</p>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-600 line-clamp-3">
          {pet.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-1">
          {(pet.traits as string[]).slice(0, 3).map((trait, index) => (
            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              {trait}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="pt-0 pb-4">
        <Link href={`/pet/${pet.id}`}>
          <div className="w-full">
            <Button variant="default" className="w-full">
              View Details
            </Button>
          </div>
        </Link>
      </CardFooter>
    </Card>
  );
}
