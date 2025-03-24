
import React from 'react';

interface ScanningStatusProps {
  isScanning: boolean;
  devicesCount: number;
}

const ScanningStatus: React.FC<ScanningStatusProps> = ({ isScanning, devicesCount }) => {
  if (isScanning && devicesCount === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-slate-400">Searching for ELM327 devices...</p>
      </div>
    );
  }

  if (!isScanning && devicesCount === 0) {
    return (
      <div className="text-center p-8 border border-dashed border-slate-700 rounded-lg">
        <p className="text-slate-400">No devices found. Try scanning again.</p>
      </div>
    );
  }

  return null;
};

export default ScanningStatus;
