import { useEffect, useRef, useState, useCallback } from 'react';

interface AudioDetectionResult {
  energyLevel: number; // dB
  isVoice: boolean;
}

interface UseAudioDetectionOptions {
  enabled: boolean;
  onVoiceDetected?: () => void;
  energyThreshold?: number; // dB threshold for Layer 1 (default: -50dB)
  analysisInterval?: number; // milliseconds between analyses (default: ~16ms for 60fps)
}

/**
 * Two-layer audio detection system:
 * Layer 1: Energy Detection (Lightweight) - detects if there's any sound
 * Layer 2: Voice Activity Detection (VAD) - detects if sound is human voice
 */
export function useAudioDetection({
  enabled,
  onVoiceDetected,
  energyThreshold = -55, // -55dB threshold (more sensitive to detect voice)
  analysisInterval = 16, // ~60fps
}: UseAudioDetectionOptions) {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [currentEnergy, setCurrentEnergy] = useState<number>(0);
  const [isVoice, setIsVoice] = useState<boolean>(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Float32Array | null>(null) as React.MutableRefObject<Float32Array | null>;
  const frequencyDataRef = useRef<Float32Array | null>(null) as React.MutableRefObject<Float32Array | null>;
  
  // Voice detection state
  const lastVoiceDetectionRef = useRef<number>(0);
  const VOICE_DETECTION_COOLDOWN = 5000; // 5 seconds between detections

  // Layer 1: Energy Detection - Calculate RMS (Root Mean Square) in dB
  const calculateEnergy = useCallback((dataArray: Float32Array | ArrayLike<number>): number => {
    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sumSquares += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sumSquares / dataArray.length);
    // Convert to dB (avoid log(0))
    const dB = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
    return dB;
  }, []);

  // Layer 2: Voice Activity Detection using frequency analysis
  // Human voice typically ranges from 85Hz to 255Hz (fundamental frequency)
  const detectVoice = useCallback((frequencyData: Float32Array, sampleRate: number): { isVoice: boolean } => {
    // frequencyData is already in frequency domain (from getFloatFrequencyData)
    const fftSize = 2048;
    const bufferLength = frequencyData.length;
    const frequencyBinSize = sampleRate / fftSize;
    
    // Analyze frequency bins corresponding to human voice range (85-255Hz)
    const voiceMinBin = Math.floor(85 / frequencyBinSize);
    const voiceMaxBin = Math.floor(255 / frequencyBinSize);
    
    // Convert dB to linear scale for threshold comparison
    // Frequency data from getFloatFrequencyData is in dB (typically -140 to 0)
    const threshold = -65; // dB threshold for voice detection (more sensitive)
    
    // Find peaks in the voice frequency range
    let voiceEnergy = 0;
    let peakCount = 0;
    let maxAmplitude = -Infinity;
    
    for (let i = voiceMinBin; i < Math.min(voiceMaxBin, bufferLength); i++) {
      const amplitude = frequencyData[i]; // Already in dB
      if (amplitude > threshold) {
        voiceEnergy += amplitude;
        peakCount++;
      }
      if (amplitude > maxAmplitude) {
        maxAmplitude = amplitude;
      }
    }
    
    // Voice is detected if we have significant energy in the voice frequency range
    // Made more sensitive: require at least 1 peak above threshold OR single strong peak
    const avgEnergy = peakCount > 0 ? voiceEnergy / peakCount : -Infinity;
    const isVoiceDetected = (peakCount >= 1 && avgEnergy > -80) || maxAmplitude > -60;
    
    // Debug logging (only log occasionally to avoid spam)
    if (isVoiceDetected && Math.random() < 0.01) { // Log 1% of the time
      console.log('Voice detected:', {
        peakCount,
        avgEnergy: avgEnergy.toFixed(2),
        maxAmplitude: maxAmplitude.toFixed(2),
        threshold: -65
      });
    }
    
    // Also log when energy is high but voice not detected (for debugging)
    if (maxAmplitude > -70 && !isVoiceDetected && Math.random() < 0.005) {
      console.log('High energy but no voice detected:', {
        peakCount,
        avgEnergy: avgEnergy.toFixed(2),
        maxAmplitude: maxAmplitude.toFixed(2),
        voiceMinBin,
        voiceMaxBin
      });
    }
    
    return {
      isVoice: isVoiceDetected,
    };
  }, []);


  // Main analysis loop
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    
    if (!dataArray) return;
    
    // Get audio data
    // Type assertion needed because getFloatTimeDomainData expects Float32Array<ArrayBuffer>
    // but our ref might be inferred as Float32Array<ArrayBufferLike>
    // @ts-expect-error - TypeScript strictness issue with ArrayBufferLike vs ArrayBuffer
    analyser.getFloatTimeDomainData(dataArray);
    
    // Layer 1: Energy Detection
    // Create a new array to ensure type compatibility
    const dataArrayForEnergy = new Float32Array(dataArray);
    const energy = calculateEnergy(dataArrayForEnergy);
    setCurrentEnergy(energy);
    
    // Only proceed to Layer 2 if energy threshold is crossed
    if (energy > energyThreshold && frequencyDataRef.current) {
      // Ensure audio context is running
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume().catch(console.error);
      }
      
      const sampleRate = audioContextRef.current?.sampleRate || 44100;
      // Get frequency domain data for voice detection
      // @ts-expect-error - TypeScript strictness issue with ArrayBufferLike vs ArrayBuffer
      analyser.getFloatFrequencyData(frequencyDataRef.current);
      const { isVoice: voiceDetected } = detectVoice(frequencyDataRef.current, sampleRate);
      setIsVoice(voiceDetected);
      
      if (voiceDetected) {
        // Trigger callback if voice detected (with cooldown)
        const now = Date.now();
        if (now - lastVoiceDetectionRef.current > VOICE_DETECTION_COOLDOWN) {
          lastVoiceDetectionRef.current = now;
          console.log('Voice detected - triggering callback, energy:', energy.toFixed(2), 'dB');
          if (onVoiceDetected) {
            try {
              onVoiceDetected();
            } catch (error) {
              console.error('Error in onVoiceDetected callback:', error);
            }
          } else {
            console.warn('onVoiceDetected callback is not defined');
          }
        }
      } else {
        setIsVoice(false);
      }
    } else {
      setIsVoice(false);
    }
    
    // Continue analysis
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, [energyThreshold, calculateEnergy, detectVoice, onVoiceDetected]);

  // Initialize audio detection
  useEffect(() => {
    if (!enabled) {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
      analyserRef.current = null;
      microphoneRef.current = null;
      setIsInitialized(false);
      return;
    }

    const initializeAudio = async () => {
      try {
        // Request microphone access
        console.log('Requesting microphone access for voice detection...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          }
        });
        
        console.log('Microphone access granted, audio tracks:', stream.getAudioTracks().length);
        streamRef.current = stream;
        
        // Log audio track state
        stream.getAudioTracks().forEach((track, index) => {
          console.log(`Audio track ${index}:`, {
            enabled: track.enabled,
            readyState: track.readyState,
            muted: track.muted,
            label: track.label
          });
        });

        // Create AudioContext
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;

        // Create analyser node
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        // Create microphone source
        const microphone = audioContext.createMediaStreamSource(stream);
        microphoneRef.current = microphone;
        microphone.connect(analyser);

        // Create data arrays for analysis
        const bufferLength = analyser.frequencyBinCount;
        // Time domain data for energy detection (needs fftSize length)
        dataArrayRef.current = new Float32Array(analyser.fftSize) as Float32Array;
        // Frequency domain data for voice detection (needs frequencyBinCount length)
        frequencyDataRef.current = new Float32Array(bufferLength) as Float32Array;

        setIsInitialized(true);
        console.log('Audio detection initialized successfully');

        // Resume audio context if suspended (required for user interaction)
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
          console.log('AudioContext resumed, state:', audioContext.state);
        }

        // Start analysis loop after a small delay to ensure everything is ready
        setTimeout(() => {
          analyzeAudio();
        }, 100);
      } catch (error) {
        console.error('Failed to initialize audio detection:', error);
        setIsInitialized(false);
      }
    };

    initializeAudio();

    return () => {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
      analyserRef.current = null;
      microphoneRef.current = null;
      dataArrayRef.current = null;
      frequencyDataRef.current = null;
    };
  }, [enabled, analyzeAudio]);

  return {
    isInitialized,
    currentEnergy,
    isVoice,
  };
}

