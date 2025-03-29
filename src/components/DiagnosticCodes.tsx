
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useOBDData } from '@/hooks/useOBDData';
import { useBluetooth } from '@/hooks/useBluetooth';

// Dicionário simples de descrições de códigos DTC comuns
const DTC_DESCRIPTIONS: Record<string, string> = {
  'P0100': 'Circuito do sensor de fluxo de massa de ar (MAF)',
  'P0101': 'Faixa/desempenho do sensor de fluxo de massa de ar (MAF)',
  'P0102': 'Entrada baixa do sensor de fluxo de massa de ar (MAF)',
  'P0171': 'Sistema muito pobre (Banco 1)',
  'P0172': 'Sistema muito rico (Banco 1)',
  'P0300': 'Falha de ignição aleatória/múltiplos cilindros detectada',
  'P0301': 'Falha de ignição detectada no cilindro 1',
  'P0302': 'Falha de ignição detectada no cilindro 2',
  'P0303': 'Falha de ignição detectada no cilindro 3',
  'P0304': 'Falha de ignição detectada no cilindro 4',
  'P0420': 'Eficiência do sistema catalisador abaixo do limite (Banco 1)',
  'P0430': 'Eficiência do sistema catalisador abaixo do limite (Banco 2)',
};

const DiagnosticCodes: React.FC = () => {
  const { data, isReadingCodes, isClearingCodes, readDiagnosticCodes, clearDiagnosticCodes } = useOBDData();
  const { connectedDevice } = useBluetooth();
  
  const isConnected = !!connectedDevice;
  const hasCodes = data.diagnosticCodes.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Códigos de Falha</CardTitle>
        <CardDescription>Verificar códigos de diagnóstico de falha (DTCs)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button 
              className="mr-2" 
              disabled={!isConnected || isReadingCodes || isClearingCodes}
              onClick={readDiagnosticCodes}
            >
              {isReadingCodes ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Lendo...
                </>
              ) : 'Ler Códigos'}
            </Button>
            <Button 
              variant="outline" 
              disabled={!isConnected || !hasCodes || isReadingCodes || isClearingCodes}
              onClick={clearDiagnosticCodes}
            >
              {isClearingCodes ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Limpando...
                </>
              ) : 'Limpar Códigos'}
            </Button>
          </div>
          
          {hasCodes ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Severidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.diagnosticCodes.map((code) => (
                  <TableRow key={code}>
                    <TableCell className="font-mono">{code}</TableCell>
                    <TableCell>{DTC_DESCRIPTIONS[code] || 'Descrição não disponível'}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
                        Moderada
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <div className="p-2 bg-slate-700">
                <h3 className="font-medium text-white">
                  {isReadingCodes ? 'Lendo códigos...' : 'Nenhum Código de Falha Encontrado'}
                </h3>
              </div>
              <div className="p-4 text-center text-slate-400">
                {isConnected 
                  ? 'Clique em "Ler Códigos" para verificar códigos de falha' 
                  : 'Conecte-se ao seu veículo para verificar códigos de falha'}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiagnosticCodes;
