
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
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [dtcCount, setDtcCount] = useState<number | null>(null);
  const [isReadingCodes, setIsReadingCodes] = useState(false);
  const [isClearingCodes, setIsClearingCodes] = useState(false);

  // Inicializar a conexão OBD quando o dispositivo estiver conectado
  useEffect(() => {
    const initializeOBD = async () => {
      if (connectedDevice && !isInitialized && !isInitializing) {
        try {
          const deviceId = connectedDevice.device.deviceId;
          console.log('Iniciando processo de inicialização OBD para o dispositivo:', deviceId);
          
          setIsInitializing(true);
          setInitializationError(false);
          
          // Timeout para detectar falhas na inicialização
          const timeoutId = setTimeout(() => {
            if (isInitializing && !isInitialized) {
              console.log('Timeout na inicialização OBD');
              setInitializationError(true);
              setIsInitializing(false);
            }
          }, 10000); // 10 segundos de timeout
          
          const connected = await OBDService.connect(deviceId);
          clearTimeout(timeoutId);
          
          if (connected) {
            console.log('OBD inicializado com sucesso');
            setIsInitialized(true);
            setIsInitializing(false);
            setInitializationError(false);
            
            toast({
              title: "OBD Inicializado",
              description: "Conexão OBD estabelecida com sucesso",
            });
          } else {
            console.log('Falha na inicialização OBD');
            setIsInitialized(false);
            setIsInitializing(false);
            setInitializationError(true);
            
            toast({
              title: "Falha na Inicialização OBD",
              description: "Não foi possível inicializar a conexão OBD",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error('Erro ao inicializar OBD:', error);
          setIsInitialized(false);
          setIsInitializing(false);
          setInitializationError(true);
          
          toast({
            title: "Erro de Conexão OBD",
            description: "Ocorreu um erro ao conectar ao adaptador OBD",
            variant: "destructive",
          });
        }
      }
      
      if (!connectedDevice) {
        if (isInitialized || isInitializing) {
          console.log('Dispositivo desconectado, resetando estado OBD');
          // Reset OBD state when device disconnects
          setIsInitialized(false);
          setIsInitializing(false);
          setInitializationError(false);
          setData(DEFAULT_DATA);
          setIsPolling(false);
          
          // Ensure OBD service is disconnected
          try {
            await OBDService.disconnect();
          } catch (error) {
            console.error('Erro ao desconectar OBD service:', error);
          }
        }
      }
    };

    initializeOBD();
  }, [connectedDevice, isInitialized, isInitializing]);

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
          
          if (rpm !== null || speed !== null || coolantTemp !== null) {
            // Se conseguimos obter algum dado, o OBD está respondendo
            setIsInitialized(true);
            setInitializationError(false);
          }
          
          setData(prev => ({
            ...prev,
            rpm: rpm !== null ? rpm : prev.rpm,
            speed: speed !== null ? speed : prev.speed,
            coolantTemp: coolantTemp !== null ? coolantTemp : prev.coolantTemp,
            lastUpdated: new Date()
          }));
        } catch (error) {
          console.error('Erro ao obter dados OBD:', error);
          // Não alterar o estado de inicialização aqui, pode ser apenas uma falha temporária
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
        // Obter os códigos de diagnóstico
        const codes = await OBDService.getDiagnosticTroubleCodes();
        setData(prev => ({
          ...prev,
          diagnosticCodes: codes
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
      const success = await OBDService.clearDiagnosticTroubleCodes();
      
      if (success) {
        setData(prev => ({
          ...prev,
          diagnosticCodes: []
        }));
        setDtcCount(0);
        
        toast({
          title: "Códigos Limpos",
          description: "Todos os códigos de falha foram limpos com sucesso",
        });
      } else {
        throw new Error('Falha ao limpar códigos');
      }
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
    isInitializing,
    initializationError,
    isReadingCodes,
    isClearingCodes,
    dtcCount,
    readDiagnosticCodes,
    clearDiagnosticCodes
  };
}
