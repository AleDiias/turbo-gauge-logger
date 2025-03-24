
import React from 'react';

interface ScanningStatusProps {
  isScanning: boolean;
  devicesCount: number;
}

const ScanningStatus: React.FC<ScanningStatusProps> = ({ isScanning, devicesCount }) => {
  if (isScanning && devicesCount === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-slate-400">Procurando por dispositivos ELM327...</p>
      </div>
    );
  }

  if (!isScanning && devicesCount === 0) {
    return (
      <div className="text-center p-8 border border-dashed border-slate-700 rounded-lg">
        <p className="text-slate-400">Nenhum dispositivo encontrado. Tente buscar novamente.</p>
      </div>
    );
  }

  return null;
};

export default ScanningStatus;
