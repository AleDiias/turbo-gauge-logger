import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BluetoothScanner } from './components/BluetoothScanner';
import { GaugeDisplay } from './components/GaugeDisplay';
import { DataLogger } from './components/DataLogger';
import { useBluetoothStore } from './stores/bluetoothStore';
import { useGaugeStore } from './stores/gaugeStore';
import { useDataLoggerStore } from './stores/dataLoggerStore';
import { useToast } from "@/components/ui/use-toast";

function App() {
  const { toast } = useToast();
  const { isConnected, deviceId, deviceName, connect, disconnect } = useBluetoothStore();
  const { 
    boostPressure, 
    oilPressure, 
    oilTemperature, 
    waterTemperature,
    updateGaugeData 
  } = useGaugeStore();
  const { 
    isLogging, 
    logData, 
    startLogging, 
    stopLogging,
    clearLogs,
    logs 
  } = useDataLoggerStore();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'l' || event.key === 'L') {
        if (isLogging) {
          stopLogging();
          toast({
            title: "Logging Parado",
            description: "O registro de dados foi interrompido.",
          });
        } else {
          startLogging();
          toast({
            title: "Logging Iniciado",
            description: "O registro de dados foi iniciado.",
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isLogging, startLogging, stopLogging, toast]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isConnected && isLogging) {
      interval = setInterval(() => {
        try {
          logData({
            timestamp: new Date().toISOString(),
            boostPressure,
            oilPressure,
            oilTemperature,
            waterTemperature
          });
        } catch (error) {
          console.error('Erro ao registrar dados:', error);
          toast({
            title: "Erro",
            description: "Não foi possível registrar os dados.",
            variant: "destructive",
          });
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isConnected, isLogging, boostPressure, oilPressure, oilTemperature, waterTemperature, logData, toast]);

  return (
    <div className="container mx-auto p-4">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="connection">Conexão</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Visão Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GaugeDisplay
                  title="Pressão do Turbo"
                  value={boostPressure}
                  unit="bar"
                  min={0}
                  max={2}
                  color="#4F46E5"
                />
                <GaugeDisplay
                  title="Pressão do Óleo"
                  value={oilPressure}
                  unit="bar"
                  min={0}
                  max={6}
                  color="#10B981"
                />
                <GaugeDisplay
                  title="Temperatura do Óleo"
                  value={oilTemperature}
                  unit="°C"
                  min={0}
                  max={150}
                  color="#F59E0B"
                />
                <GaugeDisplay
                  title="Temperatura da Água"
                  value={waterTemperature}
                  unit="°C"
                  min={0}
                  max={120}
                  color="#3B82F6"
                />
              </div>
              <div className="mt-4 flex justify-center gap-2">
                <Button 
                  onClick={isLogging ? stopLogging : startLogging}
                  variant={isLogging ? "destructive" : "default"}
                  className="w-32"
                  disabled={!isConnected}
                >
                  {isLogging ? 'Parar Log' : 'Iniciar Log'}
                </Button>
                <Button 
                  onClick={clearLogs}
                  variant="outline"
                  className="w-32"
                >
                  Limpar Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle>Conexão Bluetooth</CardTitle>
            </CardHeader>
            <CardContent>
              <BluetoothScanner />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <DataLogger />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;
