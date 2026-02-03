
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

interface Props {
  onCommand: (text: string) => void;
}

const VoiceAssistant: React.FC<Props> = ({ onCommand }) => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Clique para falar');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startAssistant = async () => {
    try {
      setIsActive(true);
      setStatus('Ouvindo...');
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = inputAudioContext;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: 'Você é um assistente de voz para um Pet Shop. Seu objetivo é ouvir comandos de voz e transcrever o que o usuário quer registrar financeiramente. Exemplo: "Registrar banho de 50 reais para o Totó". Apenas responda confirmando o que entendeu brevemente.',
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              
              const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
              
              sessionPromise.then(s => {
                if (isActive) {
                  s.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
                }
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (msg) => {
            if (msg.serverContent?.inputTranscription) {
              const text = msg.serverContent.inputTranscription.text;
              if (text && text.trim().length > 5) {
                onCommand(text);
              }
            }
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Erro ao iniciar');
      setIsActive(false);
    }
  };

  const stopAssistant = () => {
    setIsActive(false);
    setStatus('Clique para falar');
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end space-y-2">
        {isActive && (
          <div className="bg-indigo-600 text-white px-4 py-2 rounded-2xl shadow-xl text-sm font-medium animate-pulse mb-2">
            {status}
          </div>
        )}
        <button
          onClick={isActive ? stopAssistant : startAssistant}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all ${
            isActive ? 'bg-red-500 scale-110' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          <i className={`fa-solid ${isActive ? 'fa-microphone-slash' : 'fa-microphone'} text-white text-xl`}></i>
        </button>
      </div>
    </div>
  );
};

export default VoiceAssistant;
