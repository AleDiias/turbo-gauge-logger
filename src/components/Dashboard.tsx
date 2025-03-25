
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BluetoothManager from './BluetoothManager';
import { supabase } from "@/integrations/supabase/client";
import { DigitalDisplay } from './DigitalDisplay';

const mockData = [
  { time: '00:00', rpm: 0, speed: 0, temp: 0 },
  { time: '00:05', rpm: 0, speed: 0, temp: 0 },
  { time: '00:10', rpm: 0, speed: 0, temp: 0 },
  { time: '00:15', rpm: 0, speed: 0, temp: 0 },
  { time: '00:20', rpm: 0, speed: 0, temp: 0 },
  { time: '00:25', rpm: 0, speed: 0, temp: 0 },
  { time: '00:30', rpm: 0, speed: 0, temp: 0 },
];

const Dashboard: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Asgard App</h1>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="connection">Conexão</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnósticos</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>RPM do Motor</CardTitle>
                <CardDescription>Rotação atual do motor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DigitalDisplay value="0" unit="RPM" />
                <div className="w-full h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="rpm" stroke="#1EAEDB" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Velocidade</CardTitle>
                <CardDescription>Velocidade atual do veículo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DigitalDisplay value="0" unit="km/h" />
                <div className="w-full h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="speed" stroke="#1EAEDB" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Temperatura do Motor</CardTitle>
                <CardDescription>Temperatura atual do motor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DigitalDisplay value="0" unit="°C" />
                <div className="w-full h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="temp" stroke="#1EAEDB" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Status da Conexão</CardTitle>
              <CardDescription>Status atual da conexão OBD</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-lg">
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                  Não Conectado
                </div>
                <Button>Conectar ao OBD</Button>
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
              <CardTitle>Códigos de Falha</CardTitle>
              <CardDescription>Verificar códigos de diagnóstico de falha (DTCs)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button className="mr-2">Ler Códigos</Button>
                  <Button variant="outline">Limpar Códigos</Button>
                </div>
                
                <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                  <div className="p-2 bg-slate-700">
                    <h3 className="font-medium text-white">Nenhum Código de Falha Encontrado</h3>
                  </div>
                  <div className="p-4 text-center text-slate-400">
                    Conecte-se ao seu veículo e clique em "Ler Códigos" para verificar códigos de falha
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Conexões</CardTitle>
              <CardDescription>Conexões anteriores ao seu veículo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="p-4 text-center text-slate-400">
                  Nenhuma conexão anterior encontrada
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Diagnósticos</CardTitle>
              <CardDescription>Códigos de diagnóstico de falha detectados anteriormente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                <div className="p-4 text-center text-slate-400">
                  Nenhum histórico de diagnóstico encontrado
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
