
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BluetoothManager from './BluetoothManager';
import { supabase } from "@/integrations/supabase/client";

const mockData = [
  { time: '00:00', rpm: 800, speed: 0, temp: 70 },
  { time: '00:05', rpm: 1200, speed: 20, temp: 75 },
  { time: '00:10', rpm: 2500, speed: 45, temp: 83 },
  { time: '00:15', rpm: 3000, speed: 60, temp: 87 },
  { time: '00:20', rpm: 2000, speed: 40, temp: 85 },
  { time: '00:25', rpm: 1500, speed: 30, temp: 82 },
  { time: '00:30', rpm: 800, speed: 0, temp: 78 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Car Monitor Dashboard</h1>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Engine RPM</CardTitle>
                <CardDescription>Current engine rotation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">0 RPM</div>
                <div className="h-[150px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="rpm" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Speed</CardTitle>
                <CardDescription>Current vehicle speed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">0 km/h</div>
                <div className="h-[150px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="speed" stroke="#82ca9d" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Engine Temperature</CardTitle>
                <CardDescription>Current engine temperature</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">0 °C</div>
                <div className="h-[150px] mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="temp" stroke="#ff7300" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription>Current OBD connection status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-lg">
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                  Not Connected
                </div>
                <Button>Connect to OBD</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="connection" className="space-y-4">
          <BluetoothManager />
        </TabsContent>
        
        <TabsContent value="diagnostics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Trouble Codes</CardTitle>
              <CardDescription>Check for diagnostic trouble codes (DTCs)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button className="mr-2">Read DTCs</Button>
                  <Button variant="outline">Clear DTCs</Button>
                </div>
                
                <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                  <div className="p-2 bg-slate-700">
                    <h3 className="font-medium">No Trouble Codes Found</h3>
                  </div>
                  <div className="p-4 text-center text-slate-400">
                    Connect to your vehicle and click "Read DTCs" to check for trouble codes
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connection History</CardTitle>
              <CardDescription>Previous connections to your vehicle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="p-4 text-center text-slate-400">
                  No previous connections found
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic History</CardTitle>
              <CardDescription>Previously detected diagnostic trouble codes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="p-4 text-center text-slate-400">
                  No diagnostic history found
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
