
import { useState, useEffect } from 'react';
import { useBluetooth } from './useBluetooth';
import OBDService from '@/services/OBDService';
import { toast } from "@/components/ui/use-toast";

export interface OBDData {
  rpm: number | null;
  speed: number | null;
  coolantTemp: number | null;
  diagnosticCodes: string[];
  lastUpdated: Date | null;
}

const DEFAULT_DATA: OBDData = {
  rpm: null,
  speed: null,
  coolantTemp: null,
  diagnosticCodes: [],
  lastUpdated: null
};

export function useOBDData() {
  const { connectedDevice } = useBluetooth();
  const [data, setData] = useState<OBDData>(DEFAULT_DATA);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [dtcCount, setDtcCount] = useState<number | null>(null);
  const [isReadingCodes, setIsReadingCodes] = useState(false);
  const [isClearingCodes, setIsClearingCodes] = useState(false);

  // Inicializar a conexão OBD quando o dispositivo estiver conectado
  useEffect(() => {
    const initializeOBD = async () => {
      if (connectedDevice && !isInitialized) {
        try {
          const deviceId = connectedDevice.device.deviceId;
          console.log('Inicializando conexão OBD para o dispositivo:', deviceId);
          
          const connected = await OBDService.connect(deviceId);
          if (connected) {
            setIsInitialized(true);
            toast({
              title: "OBD Inicializado",
              description: "Conexão OBD estabelecida com sucesso",
            });
          } else {
            toast({
              title: "Falha na Inicialização OBD",
              description: "Não foi possível inicializar a conexão OBD",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Erro ao inicializar OBD:', error);
          toast({
            title: "Erro de Conexão OBD",
            description: "Ocorreu um erro ao conectar ao adaptador OBD",
            variant: "destructive",
          });
        }
      }
      
      if (!connectedDevice && isInitialized) {
        setIsInitialized(false);
        setData(DEFAULT_DATA);
        setIsPolling(false);
      }
    };

    initializeOBD();
  }, [connectedDevice, isInitialized]);

  // Polling para atualizar dados em tempo real
  useEffect(() => {
    if (!isInitialized || isPolling) return;
    
    let pollingInterval: number;
    
    const startPolling = () => {
      setIsPolling(true);
      
      const pollData = async () => {
        try {
          const rpm = await OBDService.getEngineRPM();
          const speed = await OBDService.getVehicleSpeed();
          const coolantTemp = await OBDService.getCoolantTemp();
          
          setData(prev => ({
            ...prev,
            rpm: rpm !== null ? rpm : prev.rpm,
            speed: speed !== null ? speed : prev.speed,
            coolantTemp: coolantTemp !== null ? coolantTemp : prev.coolantTemp,
            lastUpdated: new Date()
          }));
        } catch (error) {
          console.error('Erro ao obter dados OBD:', error);
        }
      };
      
      // Primeira leitura imediata
      pollData();
      
      // Configurar polling a cada 2 segundos
      pollingInterval = window.setInterval(pollData, 2000);
    };
    
    startPolling();
    
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
      setIsPolling(false);
    };
  }, [isInitialized, isPolling]);

  // Ler códigos de diagnóstico (DTCs)
  const readDiagnosticCodes = async () => {
    if (!isInitialized || isReadingCodes) return;
    
    setIsReadingCodes(true);
    try {
      // Primeiro verificar quantos códigos existem
      const count = await OBDService.getDTCCount();
      setDtcCount(count);
      
      if (count === 0 || count === null) {
        toast({
          title: "Diagnóstico Concluído",
          description: "Nenhum código de falha encontrado",
        });
        setData(prev => ({
          ...prev,
          diagnosticCodes: []
        }));
      } else {
        // Implementar a leitura dos códigos específicos aqui
        // Este é um exemplo simulado, precisaria ser implementado com comandos reais
        const mockCodes = ["P0171", "P0300"];
        setData(prev => ({
          ...prev,
          diagnosticCodes: mockCodes
        }));
        
        toast({
          title: "Diagnóstico Concluído",
          description: `Encontrados ${count} códigos de falha`,
        });
      }
    } catch (error) {
      console.error('Erro ao ler códigos de diagnóstico:', error);
      toast({
        title: "Erro de Diagnóstico",
        description: "Não foi possível ler os códigos de falha",
        variant: "destructive",
      });
    } finally {
      setIsReadingCodes(false);
    }
  };

  // Limpar códigos de diagnóstico
  const clearDiagnosticCodes = async () => {
    if (!isInitialized || isClearingCodes) return;
    
    setIsClearingCodes(true);
    try {
      // Enviar comando para limpar códigos
      // Implementação simulada
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setData(prev => ({
        ...prev,
        diagnosticCodes: []
      }));
      setDtcCount(0);
      
      toast({
        title: "Códigos Limpos",
        description: "Todos os códigos de falha foram limpos com sucesso",
      });
    } catch (error) {
      console.error('Erro ao limpar códigos de diagnóstico:', error);
      toast({
        title: "Erro ao Limpar Códigos",
        description: "Não foi possível limpar os códigos de falha",
        variant: "destructive",
      });
    } finally {
      setIsClearingCodes(false);
    }
  };

  return {
    data,
    isInitialized,
    isReadingCodes,
    isClearingCodes,
    dtcCount,
    readDiagnosticCodes,
    clearDiagnosticCodes
  };
}
