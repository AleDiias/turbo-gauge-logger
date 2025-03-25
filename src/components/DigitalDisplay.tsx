
import React from 'react';

interface DigitalDisplayProps {
  value: string;
  unit: string;
}

export const DigitalDisplay: React.FC<DigitalDisplayProps> = ({ value, unit }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-md p-3 flex justify-center items-center">
      <div className="font-mono text-4xl font-bold text-[#1EAEDB]">{value}</div>
      <div className="ml-2 text-white font-medium">{unit}</div>
    </div>
  );
};
