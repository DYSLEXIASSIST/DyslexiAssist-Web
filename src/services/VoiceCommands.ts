import { createSpeechlySpeechRecognition } from '@speechly/speech-recognition-polyfill';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

export class VoiceCommands {
  private recognition: typeof SpeechRecognition;
  private isListening: boolean = false;
  
  constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.setupRecognition();
    } else {
      console.error('Speech recognition not supported');
    }
  }

  private setupRecognition() {
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
      this.processCommand(command);
    };
  }

  private processCommand(command: string) {
    if (command.includes('menu') || command.includes('home')) {
      window.location.href = '/';
    } else if (command.includes('reading test')) {
      window.location.href = '/reading-test';
    } else if (command.includes('dictation')) {
      window.location.href = '/dictation';
    } else if (command.includes('contrast')) {
      window.location.href = '/contrast-test';
    } else if (command.includes('help')) {
      this.speakHelp();
    }
  }

  public startListening() {
    if (!this.isListening) {
      this.recognition.start();
      this.isListening = true;
    }
  }

  public stopListening() {
    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  private speakHelp() {
    const speech = new SpeechSynthesisUtterance(`
      Available commands:
      Say 'menu' or 'home' to return to the main menu
      Say 'reading test' to start a reading exercise
      Say 'dictation' to practice writing
      Say 'contrast test' to adjust colors
      Say 'help' to hear these commands again
    `);
    window.speechSynthesis.speak(speech);
  }
}