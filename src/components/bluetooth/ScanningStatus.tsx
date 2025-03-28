import React from 'react';
import { ScanResult } from '@capacitor-community/bluetooth-le';
import { Button } from "@/components/ui/button";

interface ScanningStatusProps {
  isScanning: boolean;
  devicesCount: number;
  connectedDevice: ScanResult | null;
}

const ScanningStatus: React.FC<ScanningStatusProps> = ({ 
  isScanning, 
  devicesCount,
  connectedDevice 
}) => {
  // Nunca mostrar nada se houver um dispositivo conectado
  if (connectedDevice) {
    return null;
  }

  // Se não estiver conectado e não estiver escaneando, mostrar mensagem de ajuda
  if (!isScanning && devicesCount === 0) {
    return (
      <div className="text-center p-8 border border-dashed border-slate-700 rounded-lg">
        <p className="text-slate-400">Nenhum dispositivo encontrado.</p>
        <p className="text-slate-500 mt-2 text-sm">
          Dicas:
          <br />
          1. Verifique se o adaptador OBD-II está ligado
          <br />
          2. Mantenha o adaptador próximo ao celular
          <br />
          3. Tente reiniciar o adaptador
        </p>
      </div>
    );
  }

  // Se estiver escaneando e não houver dispositivo conectado, mostrar mensagem de busca
  if (isScanning && !connectedDevice) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg text-center max-w-sm mx-auto">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg font-semibold mb-2">
            Procurando por dispositivos Bluetooth...
          </p>
          <p className="text-slate-400 text-sm mb-4">
            Certifique-se de que seu adaptador OBD-II está ligado e próximo.
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default ScanningStatus;
