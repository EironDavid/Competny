import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import UserLayout from "@/components/layouts/user-layout";
import { FosterApplication, Pet, TrackingData } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Activity,
  Calendar,
  Clock,
  PawPrint,
  AlertCircle,
  Navigation,
  Zap,
  Heart
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Create custom pet icon
const petIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#ef4444" stroke="#fff" stroke-width="2"/>
      <g fill="white">
        <circle cx="12" cy="12" r="2"/>
        <circle cx="20" cy="12" r="2"/>
        <ellipse cx="12" cy="8" rx="1.5" ry="2"/>
        <ellipse cx="20" cy="8" rx="1.5" ry="2"/>
        <circle cx="16" cy="20" r="3"/>
      </g>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

interface Position {
  lat: number;
  lng: number;
  accuracy: number;
}

interface ActivityMetrics {
  totalDistance: number;
  averageSpeed: number;
  activeTime: number;
  restTime: number;
  lastPositions: Array<{ lat: number; lng: number; timestamp: number; speed: number }>;
}

// Map Component
function LiveTrackingMap({ position, petName, healthStatus, activityData }: {
  position: { lat: number; lng: number; accuracy: number } | null;
  petName: string;
  healthStatus: string;
  activityData: ActivityMetrics;
}) {
  if (!position) {
    return (
      <div className="h-80 w-full rounded-lg border bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">Start Live Tracking</h3>
          <p className="text-sm">Click "Start Live Tracking" to see the map with real-time location</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80 w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        key={`${position.lat}-${position.lng}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[position.lat, position.lng]} icon={petIcon}>
          <Popup>
            <div className="text-center">
              <strong>{petName}'s Live Location</strong><br />
              <small>Health: {healthStatus}</small><br />
              <small>Speed: {activityData.averageSpeed.toFixed(2)}m/s</small><br />
              <small>Distance: {activityData.totalDistance.toFixed(1)}m</small><br />
              <small>Accuracy: ±{Math.round(position.accuracy)}m</small><br />
              <small>{new Date().toLocaleTimeString()}</small>
            </div>
          </Popup>
        </Marker>
        <Circle
          center={[position.lat, position.lng]}
          radius={position.accuracy}
          pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
        />
      </MapContainer>
    </div>
  );
}

export default function PetTracking() {
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [positionError, setPositionError] = useState<string | null>(null);
  const [trackingSessionId, setTrackingSessionId] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<ActivityMetrics>({
    totalDistance: 0,
    averageSpeed: 0,
    activeTime: 0,
    restTime: 0,
    lastPositions: []
  });
  const queryClient = useQueryClient();

  // Fetch user's approved applications
  const { data: applications, isLoading: isLoadingApplications } = useQuery<FosterApplication[]>({
    queryKey: ["/api/my-applications"],
  });

  // Filter only approved applications
  const approvedApplications = applications?.filter(app => app.status === "approved") || [];

  // Fetch all pets to get details for tracking
  const { data: pets, isLoading: isLoadingPets } = useQuery<Pet[]>({
    queryKey: ["/api/pets"],
  });

  // Get pet details for approved applications
  const fosteredPets = approvedApplications.map(app => {
    return pets?.find(pet => pet.id === app.pet_id);
  }).filter(Boolean) as Pet[];

  // Get selected pet ID (default to first pet if available)
  const effectiveSelectedPetId = selectedPetId || 
    (fosteredPets.length > 0 ? fosteredPets[0].id.toString() : null);

  // Mutation for adding tracking data
  const addTrackingMutation = useMutation({
    mutationFn: async (data: { 
      pet_id: number; 
      location: string; 
      health_status: string;
      activity_level?: string;
      phone_coordinates?: string;
      tracking_method?: string;
      notes?: string;
    }) => {
      const response = await fetch("/api/pet-tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to add tracking data");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/pet-tracking/${effectiveSelectedPetId}`] });
    },
  });

  // Fetch tracking data for selected pet
  const { data: trackingData, isLoading: isLoadingTracking } = useQuery<TrackingData[]>({
    queryKey: [`/api/pet-tracking/${effectiveSelectedPetId}`],
    enabled: !!effectiveSelectedPetId,
    staleTime: 30000,
  });

  // Get the selected pet object
  const selectedPet = effectiveSelectedPetId 
    ? pets?.find(pet => pet.id === Number(effectiveSelectedPetId)) 
    : null;

  const isLoading = isLoadingApplications || isLoadingPets || isLoadingTracking;

  // Calculate distance between two GPS points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  // Calculate health status based on activity metrics
  const calculateHealthFromActivity = (activity: ActivityMetrics): string => {
    const { totalDistance, averageSpeed, activeTime, restTime } = activity;
    const totalTime = activeTime + restTime;

    if (totalTime < 300) return "monitoring"; // Less than 5 minutes of data

    const activityRatio = activeTime / totalTime;

    // Health scoring based on pet activity patterns
    let healthScore = 0;

    // Distance factor
    if (totalDistance > 50 && totalDistance < 5000) healthScore += 30;
    else if (totalDistance > 20) healthScore += 20;
    else healthScore += 10;

    // Activity ratio factor
    if (activityRatio > 0.2 && activityRatio < 0.6) healthScore += 30;
    else if (activityRatio > 0.1) healthScore += 20;
    else healthScore += 10;

    // Speed factor
    if (averageSpeed > 0.1 && averageSpeed < 2.0) healthScore += 25;
    else if (averageSpeed > 0.05) healthScore += 15;
    else healthScore += 5;

    // Regular movement pattern bonus
    if (activity.lastPositions.length > 10) {
      const movements = activity.lastPositions.slice(-10);
      const hasRegularMovement = movements.some(pos => pos.speed > 0.1);
      if (hasRegularMovement) healthScore += 15;
    }

    // Determine health status based on score
    if (healthScore >= 85) return "excellent";
    else if (healthScore >= 70) return "good";
    else if (healthScore >= 50) return "fair";
    else return "poor";
  };

  // Update activity data when position changes
  const updateActivityData = (newPosition: Position) => {
    const now = Date.now();

    setActivityData(prev => {
      const newPositions = [...prev.lastPositions];

      // Calculate speed and distance if we have a previous position
      let speed = 0;
      let distanceIncrement = 0;

      if (newPositions.length > 0) {
        const lastPos = newPositions[newPositions.length - 1];
        const timeDiff = (now - lastPos.timestamp) / 1000; // seconds

        if (timeDiff > 0) {
          distanceIncrement = calculateDistance(
            lastPos.lat, lastPos.lng,
            newPosition.lat, newPosition.lng
          );
          speed = distanceIncrement / timeDiff; // m/s
        }
      }

      // Add new position with speed
      newPositions.push({
        lat: newPosition.lat,
        lng: newPosition.lng,
        timestamp: now,
        speed
      });

      // Keep only last 50 positions
      if (newPositions.length > 50) {
        newPositions.splice(0, newPositions.length - 50);
      }

      // Calculate activity metrics
      const totalDistance = prev.totalDistance + distanceIncrement;
      const speeds = newPositions.map(pos => pos.speed).filter(s => s > 0);
      const averageSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;

      // Calculate active vs rest time
      const activeTime = prev.activeTime + (speed > 0.05 ? 30 : 0);
      const restTime = prev.restTime + (speed <= 0.05 ? 30 : 0);

      return {
        totalDistance,
        averageSpeed,
        activeTime,
        restTime,
        lastPositions: newPositions
      };
    });
  };

  // Live GPS tracking functionality with activity monitoring
  useEffect(() => {
    let watchId: number | null = null;
    let trackingInterval: NodeJS.Timeout | null = null;

    if (isLiveTracking && effectiveSelectedPetId) {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        setPositionError("Geolocation is not supported by this browser");
        setIsLiveTracking(false);
        return;
      }

      // Start watching position
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const newPosition: Position = { lat: latitude, lng: longitude, accuracy };

          setCurrentPosition(newPosition);
          setPositionError(null);

          // Update activity data
          updateActivityData(newPosition);
        },
        (error) => {
          let errorMessage = "Unknown error occurred";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }
          setPositionError(errorMessage);
          setIsLiveTracking(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );

      // Auto-submit tracking data every 30 seconds
      trackingInterval = setInterval(() => {
        if (currentPosition && effectiveSelectedPetId) {
          const calculatedHealth = calculateHealthFromActivity(activityData);

          addTrackingMutation.mutate({
            pet_id: Number(effectiveSelectedPetId),
            location: `Live GPS: ${currentPosition.lat.toFixed(6)}, ${currentPosition.lng.toFixed(6)} (±${Math.round(currentPosition.accuracy)}m)`,
            health_status: calculatedHealth,
            activity_level: activityData.averageSpeed > 0.2 ? "high" : activityData.averageSpeed > 0.05 ? "moderate" : "low",
            phone_coordinates: `${currentPosition.lat},${currentPosition.lng}`,
            tracking_method: "phone_gps_auto",
            notes: `Auto-calculated: Distance: ${activityData.totalDistance.toFixed(1)}m, Speed: ${activityData.averageSpeed.toFixed(2)}m/s, Active: ${Math.round(activityData.activeTime/60)}min`
          });
        }
      }, 30000);

      setTrackingSessionId(Date.now().toString());
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (trackingInterval) {
        clearInterval(trackingInterval);
      }
    };
  }, [isLiveTracking, effectiveSelectedPetId, currentPosition, activityData]);

  // Start live tracking
  const startLiveTracking = () => {
    setIsLiveTracking(true);
    setPositionError(null);
    setActivityData({
      totalDistance: 0,
      averageSpeed: 0,
      activeTime: 0,
      restTime: 0,
      lastPositions: []
    });
  };

  // Stop live tracking
  const stopLiveTracking = () => {
    setIsLiveTracking(false);
    setCurrentPosition(null);
    setTrackingSessionId(null);
  };

  const currentHealthStatus = calculateHealthFromActivity(activityData);

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Pet Tracking</h1>
              <p className="text-gray-600">Real-time location and health monitoring for your fostered pets</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-2">
                <Navigation className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">GPS Enabled</span>
              </div>
            </div>
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
                <Skeleton className="h-10 w-full sm:w-64" />
              </CardContent>
            </Card>
          </div>
        ) : fosteredPets.length > 0 ? (
          <div className="space-y-6">
            {/* Pet Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PawPrint className="h-5 w-5 mr-2 text-primary" />
                  Select Pet to Track
                </CardTitle>
                <CardDescription>
                  Choose one of your fostered pets for live monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={effectiveSelectedPetId?.toString()}
                  onValueChange={(value) => setSelectedPetId(value)}
                >
                  <SelectTrigger className="w-full sm:w-[300px]">
                    <SelectValue placeholder="Select a pet" />
                  </SelectTrigger>
                  <SelectContent>
                    {fosteredPets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id.toString()}>
                        <div className="flex items-center">
                          <span className="mr-2">🐾</span>
                          {pet.name} ({pet.breed})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedPet && (
              <>
                {/* Live Tracking Status */}
                <Card className="border-2 border-dashed border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                      Live Tracking for {selectedPet.name}
                    </CardTitle>
                    <CardDescription>
                      Real-time GPS monitoring with automatic health assessment
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Tracking Controls */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${isLiveTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                        <div>
                          <h3 className="font-medium">Tracking Status</h3>
                          <p className="text-sm text-gray-600">
                            {isLiveTracking ? "🟢 Active - Location updating every 30 seconds" : "🔴 Inactive"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!isLiveTracking ? (
                          <Button onClick={startLiveTracking} className="bg-green-600 hover:bg-green-700">
                            <Navigation className="h-4 w-4 mr-2" />
                            Start Live Tracking
                          </Button>
                        ) : (
                          <Button onClick={stopLiveTracking} variant="destructive">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Stop Tracking
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Current Position Info */}
                    {currentPosition && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center mb-2">
                            <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                            <h4 className="font-medium text-blue-900">Current Location</h4>
                          </div>
                          <p className="text-sm text-blue-700 font-mono">
                            {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Accuracy: ±{Math.round(currentPosition.accuracy)}m
                          </p>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center mb-2">
                            <Activity className="h-5 w-5 text-green-600 mr-2" />
                            <h4 className="font-medium text-green-900">Activity Metrics</h4>
                          </div>
                          <p className="text-sm text-green-700">
                            Distance: {activityData.totalDistance.toFixed(1)}m
                          </p>
                          <p className="text-sm text-green-700">
                            Speed: {activityData.averageSpeed.toFixed(2)}m/s
                          </p>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center mb-2">
                            <Heart className="h-5 w-5 text-purple-600 mr-2" />
                            <h4 className="font-medium text-purple-900">Health Status</h4>
                          </div>
                          <p className="text-sm text-purple-700 capitalize font-medium">
                            {currentHealthStatus}
                          </p>
                          <p className="text-xs text-purple-600 mt-1">
                            Active: {Math.round(activityData.activeTime/60)}min
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Live Map */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-primary" />
                        {currentPosition ? "Live Location Map" : "Map View"}
                      </h3>

                      <LiveTrackingMap 
                        position={currentPosition}
                        petName={selectedPet.name}
                        healthStatus={currentHealthStatus}
                        activityData={activityData}
                      />
                    </div>

                    {/* Error Display */}
                    {positionError && (
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                          <h3 className="font-medium text-red-900">Location Error</h3>
                        </div>
                        <p className="text-sm text-red-700 mt-1">{positionError}</p>
                        <Button 
                          onClick={startLiveTracking} 
                          size="sm" 
                          className="mt-2"
                          variant="outline"
                        >
                          Try Again
                        </Button>
                      </div>
                    )}

                    {/* Activity Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-3 border rounded-lg bg-white">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-600">Total Distance</h4>
                          <MapPin className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold mt-1">
                          {isLiveTracking ? `${activityData.totalDistance.toFixed(1)}m` : "Not tracking"}
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg bg-white">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-600">Average Speed</h4>
                          <Activity className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold mt-1">
                          {isLiveTracking ? `${activityData.averageSpeed.toFixed(2)}m/s` : "Not tracking"}
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg bg-white">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-600">Active Time</h4>
                          <Clock className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold mt-1">
                          {isLiveTracking ? `${Math.round(activityData.activeTime/60)}min` : "Not tracking"}
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg bg-white">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-600">Health Score</h4>
                          <Heart className="h-4 w-4 text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold mt-1 capitalize">
                          {isLiveTracking ? currentHealthStatus : "Not tracking"}
                        </p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => {
                          if (effectiveSelectedPetId && currentPosition) {
                            addTrackingMutation.mutate({
                              pet_id: Number(effectiveSelectedPetId),
                              location: `Manual GPS: ${currentPosition.lat.toFixed(6)}, ${currentPosition.lng.toFixed(6)}`,
                              health_status: currentHealthStatus,
                              activity_level: activityData.averageSpeed > 0.2 ? "high" : "moderate",
                              tracking_method: "manual_record"
                            });
                          }
                        }}
                        disabled={!currentPosition || addTrackingMutation.isPending}
                        variant="outline"
                        size="sm"
                      >
                        {addTrackingMutation.isPending ? "Recording..." : "Record Current Status"}
                      </Button>

                      {isLiveTracking && (
                        <Badge variant="secondary" className="px-3 py-1">
                          Auto-recording every 30 seconds
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Tracking History */}
                <TrackingInformation pet={selectedPet} trackingData={trackingData || []} />
              </>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <PawPrint className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium text-gray-900">No Pets Available for Tracking</h3>
              <p className="mt-2 text-gray-500 max-w-md mx-auto">
                You don't have any approved foster pets to track yet. Once your foster application is approved, 
                you'll be able to monitor your pet's location and health status here.
              </p>
              <div className="mt-6">
                <Button variant="outline">
                  View My Applications
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </UserLayout>
  );
}

// Component for displaying tracking information and history
function TrackingInformation({ pet, trackingData }: { pet: Pet; trackingData: TrackingData[] }) {
  // Sort tracking data by timestamp, newest first
  const sortedData = [...trackingData].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Get health status display info
  const getHealthStatus = (status: string | undefined) => {
    if (!status) return { label: "Unknown", color: "bg-gray-100 text-gray-800", icon: "❓" };

    switch (status.toLowerCase()) {
      case "excellent":
        return { label: "Excellent", color: "bg-green-100 text-green-800", icon: "💚" };
      case "good":
        return { label: "Good", color: "bg-blue-100 text-blue-800", icon: "💙" };
      case "fair":
        return { label: "Fair", color: "bg-yellow-100 text-yellow-800", icon: "💛" };
      case "poor":
        return { label: "Poor", color: "bg-red-100 text-red-800", icon: "❤️" };
      case "monitoring":
        return { label: "Monitoring", color: "bg-purple-100 text-purple-800", icon: "👁️" };
      default:
        return { label: status, color: "bg-gray-100 text-gray-800", icon: "📊" };
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary" />
          {pet.name}'s Tracking History
        </CardTitle>
        <CardDescription>
          Complete tracking records and location history
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedData.length > 0 ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Showing {sortedData.length} tracking record{sortedData.length !== 1 ? 's' : ''}
            </div>

            {sortedData.map((data, index) => (
              <div key={data.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 flex items-center">
                      {index === 0 ? (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Latest Update
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                          Record #{sortedData.length - index}
                        </>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      📅 {new Date(data.timestamp).toLocaleDateString()} at {new Date(data.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${getHealthStatus(data.health_status).color} border-0`}
                  >
                    {getHealthStatus(data.health_status).icon} {getHealthStatus(data.health_status).label}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs text-gray-500 block">Location:</span>
                      <p className="text-sm break-words">{data.location || "Not recorded"}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Activity className="h-4 w-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <span className="text-xs text-gray-500 block">Health & Activity:</span>
                      <p className="text-sm">
                        {data.health_status || "Not recorded"}
                        {data.activity_level && (
                          <span className="text-gray-500"> • {data.activity_level} activity</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {data.notes && (
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-xs text-gray-500">Notes:</span>
                    <p className="text-sm text-gray-700 mt-1">{data.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border rounded-lg bg-gray-50">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <AlertCircle className="h-6 w-6 text-gray-600" />
            </div>
            <h3 className="mt-3 text-sm font-medium text-gray-900">No tracking data available</h3>
            <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
              No tracking records found for {pet.name}. Start live tracking to begin collecting location and health data.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}