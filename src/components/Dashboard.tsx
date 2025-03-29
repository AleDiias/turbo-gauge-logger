
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import BluetoothManager from './BluetoothManager';
import { supabase } from "@/integrations/supabase/client";
import { DigitalDisplay } from './DigitalDisplay';
import { useBluetooth } from '@/hooks/useBluetooth';
import { useOBDData } from '@/hooks/useOBDData';
import DiagnosticCodes from './DiagnosticCodes';
import { Gauge, Thermometer, Activity } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { connectedDevice } = useBluetooth();
  const { data } = useOBDData();
  
  const isConnected = !!connectedDevice;

  // Gerar dados fictícios para o gráfico baseado nos dados reais
  const generateChartData = (value: number | null, dataKey: string) => {
    // Se não houver valor, retornar dados vazios
    if (value === null) return [];
    
    const now = new Date();
    const result = [];
    
    // Criar 7 pontos de dados para o gráfico
    for (let i = 6; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5000);
      const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`;
      
      // Varia o valor para simular mudanças
      const randomVariation = Math.random() * 0.2 - 0.1; // -10% a +10%
      const adjustedValue = i === 0 ? value : Math.max(0, value * (1 + randomVariation * i));
      
      const dataPoint: any = { time: timeStr };
      dataPoint[dataKey] = Math.round(adjustedValue);
      result.push(dataPoint);
    }
    
    return result;
  };

  const rpmChartData = generateChartData(data.rpm || 0, 'rpm');
  const speedChartData = generateChartData(data.speed || 0, 'speed');
  const tempChartData = generateChartData(data.coolantTemp || 0, 'temp');

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
                <CardTitle className="flex items-center">
                  <Gauge className="mr-2 h-5 w-5" />
                  RPM do Motor
                </CardTitle>
                <CardDescription>Rotação atual do motor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DigitalDisplay 
                  value={data.rpm !== null ? data.rpm.toString() : "---"} 
                  unit="RPM" 
                />
                <div className="w-full h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rpmChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="rpm" 
                        stroke="#1EAEDB" 
                        activeDot={{ r: 8 }} 
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Activity className="mr-2 h-5 w-5" />
                  Velocidade
                </CardTitle>
                <CardDescription>Velocidade atual do veículo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DigitalDisplay 
                  value={data.speed !== null ? data.speed.toString() : "---"} 
                  unit="km/h" 
                />
                <div className="w-full h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={speedChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="speed" 
                        stroke="#1EAEDB" 
                        activeDot={{ r: 8 }} 
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <Thermometer className="mr-2 h-5 w-5" />
                  Temperatura do Motor
                </CardTitle>
                <CardDescription>Temperatura atual do motor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DigitalDisplay 
                  value={data.coolantTemp !== null ? data.coolantTemp.toString() : "---"} 
                  unit="°C" 
                />
                <div className="w-full h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tempChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="temp" 
                        stroke="#1EAEDB" 
                        activeDot={{ r: 8 }} 
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="connection" className="space-y-4">
          <BluetoothManager />
        </TabsContent>
        
        <TabsContent value="diagnostics" className="space-y-4">
          <DiagnosticCodes />
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
