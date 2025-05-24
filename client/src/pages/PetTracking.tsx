import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Custom marker icon for the pet
const petIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1998/1998627.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

// Sample pet data
const initialPet = {
  name: "Max",
  breed: "Golden Retriever",
  age: 3,
  weight: 65, // in pounds
};

// Component to display the pet tracking information
const PetTracking = () => {
  const [pet, setPet] = useState(initialPet);
  const [currentLocation, setCurrentLocation] = useState({ lat: 37.7749, lng: -122.4194 });
  const [pathHistory, setPathHistory] = useState<{lat: number, lng: number}[]>([]);
  const [healthData, setHealthData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const [status, setStatus] = useState("Active");

  // Function to simulate pet movement
  useEffect(() => {
    // Generate the initial 24 hours of data
    const initialHealthData = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date();
      hour.setHours(hour.getHours() - 24 + i);
      
      return {
        time: hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        heartRate: Math.floor(Math.random() * 20) + 70, // 70-90 bpm
        temperature: ((Math.random() * 1) + 101).toFixed(1), // 101-102°F
        restingPercentage: Math.floor(Math.random() * 30) + 50, // 50-80%
      };
    });
    
    const initialActivityData = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date();
      hour.setHours(hour.getHours() - 24 + i);
      
      return {
        time: hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        steps: Math.floor(Math.random() * 300) + 100, // 100-400 steps per hour
        distance: ((Math.random() * 0.8) + 0.2).toFixed(1), // 0.2-1.0 miles
        calories: Math.floor(Math.random() * 30) + 20, // 20-50 calories
      };
    });
    
    setHealthData(initialHealthData);
    setActivityData(initialActivityData);
    
    // Set up interval for real-time updates
    const interval = setInterval(() => {
      if (isLive) {
        setCurrentTime(new Date());
        
        // Update location (simulate movement)
        setCurrentLocation(prev => {
          const latChange = (Math.random() - 0.5) * 0.002;
          const lngChange = (Math.random() - 0.5) * 0.002;
          
          const newLocation = {
            lat: prev.lat + latChange,
            lng: prev.lng + lngChange
          };
          
          // Update path history
          setPathHistory(history => [...history, newLocation]);
          
          return newLocation;
        });
        
        // Update health data
        const newHealthReading = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          heartRate: Math.floor(Math.random() * 20) + 70, // 70-90 bpm
          temperature: ((Math.random() * 1) + 101).toFixed(1), // 101-102°F
          restingPercentage: Math.floor(Math.random() * 30) + 50, // 50-80%
        };
        
        // Update activity data
        const newActivityReading = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          steps: Math.floor(Math.random() * 300) + 100, // 100-400 steps per hour
          distance: ((Math.random() * 0.8) + 0.2).toFixed(1), // 0.2-1.0 miles
          calories: Math.floor(Math.random() * 30) + 20, // 20-50 calories
        };
        
        setHealthData(prev => [...prev.slice(1), newHealthReading]);
        setActivityData(prev => [...prev.slice(1), newActivityReading]);
        
        // Randomly update pet status
        if (Math.random() > 0.9) {
          const statuses = ["Active", "Resting", "Playing", "Walking", "Sleeping"];
          setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
        }
      }
    }, 3000); // Update every 3 seconds
    
    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Pet Tracker: {pet.name}</h1>
        <div className="flex space-x-4 items-center">
          <span className={`px-3 py-1 rounded-full ${
            status === "Active" ? "bg-green-100 text-green-800" : 
            status === "Resting" ? "bg-blue-100 text-blue-800" : 
            status === "Playing" ? "bg-yellow-100 text-yellow-800" :
            status === "Walking" ? "bg-purple-100 text-purple-800" :
            "bg-gray-100 text-gray-800"
          }`}>
            {status}
          </span>
          <button 
            className={`px-4 py-2 rounded-lg ${isLive ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? 'Pause' : 'Live'}
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pet Profile Card */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/1998/1998627.png"
                alt="Pet"
                className="w-10 h-10"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{pet.name}</h2>
              <p className="text-gray-600">{pet.breed}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-sm">Age</p>
              <p className="text-lg font-medium">{pet.age} years</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-sm">Weight</p>
              <p className="text-lg font-medium">{pet.weight} lbs</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-sm">Last Check</p>
              <p className="text-lg font-medium">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500 text-sm">Battery</p>
              <p className="text-lg font-medium">87%</p>
            </div>
          </div>
        </div>
        
        {/* Location and Movement Card */}
        <div className="bg-white p-6 rounded-xl shadow-md md:col-span-2 h-[400px]">
          <h2 className="text-xl font-semibold mb-4">Location & Movement</h2>
          <div style={{ height: "320px", width: "100%" }}>
            <MapContainer center={currentLocation} zoom={17} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={currentLocation} icon={petIcon}>
                <Popup>
                  <div>
                    <h3 className="font-bold">{pet.name}</h3>
                    <p>Current Status: {status}</p>
                    <p>Last Updated: {currentTime.toLocaleTimeString()}</p>
                  </div>
                </Popup>
              </Marker>
              {pathHistory.length > 0 && (
                <Polyline 
                  positions={pathHistory} 
                  color="blue" 
                  weight={3} 
                  opacity={0.7} 
                  dashArray="5, 10" 
                />
              )}
            </MapContainer>
          </div>
        </div>
      </div>
      
      {/* Health Monitoring Card */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Health Monitoring</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-500 text-sm">Heart Rate</p>
            <div className="flex items-end space-x-2">
              <p className="text-2xl font-medium">
                {healthData[healthData.length - 1]?.heartRate}
              </p>
              <p className="text-gray-500 text-sm">bpm</p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-500 text-sm">Temperature</p>
            <div className="flex items-end space-x-2">
              <p className="text-2xl font-medium">
                {healthData[healthData.length - 1]?.temperature}
              </p>
              <p className="text-gray-500 text-sm">°F</p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-500 text-sm">Resting</p>
            <div className="flex items-end space-x-2">
              <p className="text-2xl font-medium">
                {healthData[healthData.length - 1]?.restingPercentage}
              </p>
              <p className="text-gray-500 text-sm">%</p>
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={healthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis yAxisId="left" orientation="left" domain={[60, 100]} />
            <YAxis yAxisId="right" orientation="right" domain={[100, 104]} />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="heartRate" stroke="#8884d8" activeDot={{ r: 8 }} name="Heart Rate (bpm)" />
            <Line yAxisId="right" type="monotone" dataKey="temperature" stroke="#ff7300" name="Temperature (°F)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Activity Card */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Activity Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-500 text-sm">Total Steps Today</p>
            <div className="flex items-end space-x-2">
              <p className="text-2xl font-medium">
                {activityData.reduce((sum, item) => sum + item.steps, 0).toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm">steps</p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-500 text-sm">Distance Today</p>
            <div className="flex items-end space-x-2">
              <p className="text-2xl font-medium">
                {activityData.reduce((sum, item) => sum + parseFloat(item.distance), 0).toFixed(1)}
              </p>
              <p className="text-gray-500 text-sm">miles</p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-500 text-sm">Calories Burned</p>
            <div className="flex items-end space-x-2">
              <p className="text-2xl font-medium">
                {activityData.reduce((sum, item) => sum + item.calories, 0).toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm">cal</p>
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="steps" stackId="1" stroke="#8884d8" fill="#8884d8" name="Steps" />
            <Area type="monotone" dataKey="distance" stackId="2" stroke="#82ca9d" fill="#82ca9d" name="Distance (miles)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Safe Zones Card */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Safe Zones</h2>
          <button className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm">Add Zone</button>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Home</h3>
                <p className="text-gray-500 text-sm">200 yard radius</p>
              </div>
            </div>
            <div className="text-green-600 font-medium">Inside</div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium">Dog Park</h3>
                <p className="text-gray-500 text-sm">150 yard radius</p>
              </div>
            </div>
            <div className="text-red-600 font-medium">Outside</div>
          </div>
        </div>
      </div>
      
      {/* Notifications Card */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-medium">Left safe zone "Home"</p>
              <p className="text-gray-500 text-sm">Today, 10:32 AM</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">High activity detected</p>
              <p className="text-gray-500 text-sm">Today, 9:15 AM</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-medium">Entered safe zone "Dog Park"</p>
              <p className="text-gray-500 text-sm">Today, 8:45 AM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetTracking; 