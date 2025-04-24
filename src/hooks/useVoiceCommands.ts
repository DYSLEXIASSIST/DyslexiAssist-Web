import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface VoiceCommandsState {
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
}

export const useVoiceCommands = (): VoiceCommandsState => {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      setRecognition(recognitionInstance);
    }
  }, []);

  const processCommand = useCallback(async (command: string) => {
    try {
      // Handle navigation commands directly first
      const navigationCommands = {
        menu: '/',
        home: '/',
        'reading test': '/reading-test',
        dictation: '/dictation-test',
        contrast: '/contrast-test'
      };

      // Check if it's a navigation command
      for (const [key, route] of Object.entries(navigationCommands)) {
        if (command.toLowerCase().includes(key)) {
          router.push(route);
          return;
        }
      }

      // Handle read out command
      if (command.toLowerCase().includes('read out')) {
        const mainContent = document.querySelector('main');
        if (mainContent) {
          const textToRead = mainContent.textContent || '';
          const speech = new SpeechSynthesisUtterance(textToRead);
          window.speechSynthesis.speak(speech);
          return;
        }
      }

      // Handle help command directly
      if (command.toLowerCase().includes('help')) {
        const speech = new SpeechSynthesisUtterance(
          'Available commands: menu, reading test, dictation, contrast test, read out, and help'
        );
        window.speechSynthesis.speak(speech);
        return;
      }

      // If not handled directly, send to API
      const response = await fetch('/api/voice-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: command.toLowerCase(),
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Handle API response
      if (data.action === 'speak') {
        const speech = new SpeechSynthesisUtterance(data.text);
        window.speechSynthesis.speak(speech);
      } else if (data.action === 'navigate') {
        router.push(data.route);
      }

    } catch (error) {
      console.error('Error processing voice command:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorSpeech = new SpeechSynthesisUtterance(
        `Sorry, I could not process that command. ${errorMessage}`
      );
      window.speechSynthesis.speak(errorSpeech);
    }
  }, [router]);

  const startListening = useCallback(() => {
    if (recognition && !isListening) {
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const command = event.results[event.results.length - 1][0].transcript;
        processCommand(command);
      };

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      try {
        recognition.start();
        // Provide feedback when voice recognition starts
        const startSpeech = new SpeechSynthesisUtterance('Listening for commands');
        window.speechSynthesis.speak(startSpeech);
      } catch (error) {
        console.error('Error starting voice recognition:', error);
      }
    }
  }, [recognition, isListening, processCommand]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
      // Provide feedback when voice recognition stops
      const stopSpeech = new SpeechSynthesisUtterance('Voice commands stopped');
      window.speechSynthesis.speak(stopSpeech);
    }
  }, [recognition, isListening]);

  return {
    isListening,
    startListening,
    stopListening,
  };
};