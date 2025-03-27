import React from 'react';
import { ScanResult } from '@capacitor-community/bluetooth-le';

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
  // Se já estiver conectado, não mostrar mensagem de scanning
  if (connectedDevice) {
    return null;
  }

  if (isScanning && devicesCount === 0) {
    return (
      <div className="text-center p-4 bg-slate-800/50 rounded-lg">
        <p className="text-slate-300">Procurando por dispositivos Bluetooth...</p>
        <p className="text-slate-400 text-sm mt-1">
          Certifique-se de que seu adaptador OBD-II está ligado e próximo.
        </p>
      </div>
    );
  }

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

  return null;
};

export default ScanningStatus;
