import React from "react";

interface Props {
  onCommand: (text: string) => void;
}

const VoiceAssistant: React.FC<Props> = ({ onCommand }) => {
  const handleClick = () => {
    onCommand("Assistente de voz desativado (configuração pendente).");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex flex-col items-end space-y-2">
        <div className="bg-slate-800 text-white px-4 py-2 rounded-2xl shadow-xl text-sm font-medium">
          Assistente de voz indisponível
        </div>
        <button
          onClick={handleClick}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all bg-slate-500 cursor-not-allowed"
          aria-disabled="true"
          title="Assistente de voz indisponível"
        >
          <i className="fa-solid fa-microphone-slash text-white text-xl"></i>
        </button>
      </div>
    </div>
  );
};

export default VoiceAssistant;
