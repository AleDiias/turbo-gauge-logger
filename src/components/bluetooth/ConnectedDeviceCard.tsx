
import React from 'react';
import { ScanResult } from '@capacitor-community/bluetooth-le';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface ConnectedDeviceCardProps {
  device: ScanResult;
  onDisconnect: () => Promise<void>;
  isOBDInitialized?: boolean;
  isInitializing?: boolean;
  initializationError?: boolean;
}

const ConnectedDeviceCard: React.FC<ConnectedDeviceCardProps> = ({
  device,
  onDisconnect,
  isOBDInitialized = false,
  isInitializing = true,
  initializationError = false
}) => {
  const deviceName = device.device.name || "Dispositivo Desconhecido";
  const deviceId = device.device.deviceId;

  return (
    <Card className="border-green-500/30 bg-green-500/10">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="bg-green-500/20 p-2 rounded-full">
              <Smartphone className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-medium text-lg">{deviceName}</h3>
              <p className="text-sm text-muted-foreground font-mono">{deviceId}</p>
              <div className="flex items-center mt-1 text-sm text-green-500">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                <span>Conectado</span>
              </div>
              <div className="flex items-center mt-1 text-sm">
                {isOBDInitialized ? (
                  <div className="text-green-500 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    <span>OBD Inicializado</span>
                  </div>
                ) : initializationError ? (
                  <div className="text-red-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>Falha na inicialização</span>
                  </div>
                ) : isInitializing ? (
                  <div className="text-yellow-500 flex items-center">
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    <span>Inicializando OBD...</span>
                  </div>
                ) : (
                  <div className="text-slate-500 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>Aguardando veículo</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDisconnect}>
            Desconectar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectedDeviceCard;
