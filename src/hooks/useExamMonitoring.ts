import { useEffect, useRef, useState, useCallback } from 'react';

interface MonitoringState {
  cameraActive: boolean;
  microphoneActive: boolean;
  cameraStream: MediaStream | null;
  microphoneStream: MediaStream | null;
  error: string | null;
}

interface UseExamMonitoringOptions {
  examId: string;
  enabled: boolean;
  cameraRequired?: boolean;
  microphoneRequired?: boolean;
  onSnapshot?: (imageData: string) => void;
  onAudioSample?: (audioData: string) => void;
  snapshotInterval?: number; // milliseconds
  audioSampleInterval?: number; // milliseconds
}

export function useExamMonitoring({
  examId,
  enabled,
  cameraRequired = true,
  microphoneRequired = true,
  onSnapshot,
  onAudioSample,
  snapshotInterval = 30000, // 30 seconds default
  audioSampleInterval = 10000, // 10 seconds default
}: UseExamMonitoringOptions) {
  const [state, setState] = useState<MonitoringState>({
    cameraActive: false,
    microphoneActive: false,
    cameraStream: null,
    microphoneStream: null,
    error: null,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const snapshotIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioSampleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);

  // Capture video snapshot
  const captureSnapshot = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      console.warn('Cannot capture snapshot: video or canvas not available');
      return;
    }

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (!video.videoWidth || !video.videoHeight) {
        console.warn('Video not ready for snapshot');
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.warn('Cannot get canvas context');
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.8); // Base64 encoded image

      if (onSnapshot) {
        onSnapshot(imageData);
      }
    } catch (error) {
      console.error('Error capturing snapshot:', error);
    }
  }, [onSnapshot]);

  // Capture audio sample
  const captureAudioSample = useCallback(() => {
    if (!analyserRef.current) {
      console.warn('Cannot capture audio: analyser not available');
      return;
    }

    try {
      const analyser = analyserRef.current;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      // Convert audio data to base64
      const audioData = btoa(String.fromCharCode(...dataArray));

      if (onAudioSample) {
        onAudioSample(audioData);
      }
    } catch (error) {
      console.error('Error capturing audio sample:', error);
    }
  }, [onAudioSample]);

  // Request camera and microphone access
  const startMonitoring = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }));

      let cameraStream: MediaStream | null = null;
      let microphoneStream: MediaStream | null = null;

      // Request camera access only if required
      if (cameraRequired) {
        try {
          cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: 'user',
            },
            audio: false,
          });
        } catch (error: any) {
          console.error('Failed to get camera access:', error);
          // Don't throw - allow exam to continue even if camera fails
          // Only throw if both camera and mic are required and both fail
          if (!microphoneRequired) {
            // If only camera is required and it fails, we can still continue
            console.warn('Camera access failed but exam will continue');
          }
        }
      }

      // Request microphone access only if required
      if (microphoneRequired) {
        try {
          microphoneStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
            video: false,
          });
        } catch (error: any) {
          console.error('Failed to get microphone access:', error);
          // Don't throw - allow exam to continue even if mic fails
          // Only throw if both camera and mic are required and both fail
          if (!cameraRequired) {
            // If only mic is required and it fails, we can still continue
            console.warn('Microphone access failed but exam will continue');
          }
        }
      }
      
      // If both camera and mic are required but both failed, log warning but don't throw
      if (cameraRequired && microphoneRequired && !cameraStream && !microphoneStream) {
        console.warn('Both camera and microphone access failed, but exam will continue');
      }

      // Set up video element if camera is available
      if (cameraStream && videoRef.current) {
        videoRef.current.srcObject = cameraStream;
        videoRef.current.play().catch((error) => {
          console.error('Error playing video:', error);
        });
      }

      // Set up audio context for audio analysis if microphone is available
      if (microphoneStream) {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const analyser = audioContext.createAnalyser();
          const source = audioContext.createMediaStreamSource(microphoneStream);
          source.connect(analyser);
          analyser.fftSize = 2048;

          audioContextRef.current = audioContext;
          analyserRef.current = analyser;
        } catch (error) {
          console.error('Error setting up audio context:', error);
        }
      }
      
      // Store streams in refs for cleanup
      cameraStreamRef.current = cameraStream;
      microphoneStreamRef.current = microphoneStream;

      setState({
        cameraActive: cameraStream !== null,
        microphoneActive: microphoneStream !== null,
        cameraStream,
        microphoneStream,
        error: null,
      });

      // Create canvas for snapshots
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
        canvasRef.current.width = 640;
        canvasRef.current.height = 480;
      }

      // Start periodic snapshots (only if camera is active and callback provided)
      if (onSnapshot && cameraStream) {
        // Capture initial snapshot after video is ready
        setTimeout(() => {
          captureSnapshot();
        }, 2000);
        
        snapshotIntervalRef.current = setInterval(() => {
          captureSnapshot();
        }, snapshotInterval);
      }

      // Start periodic audio samples (only if microphone is active and callback provided)
      if (onAudioSample && microphoneStream) {
        // Capture initial audio sample after audio is ready
        setTimeout(() => {
          captureAudioSample();
        }, 2000);
        
        audioSampleIntervalRef.current = setInterval(() => {
          captureAudioSample();
        }, audioSampleInterval);
      }
    } catch (error: any) {
      console.error('Error starting monitoring:', error);
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to access camera/microphone',
      }));
    }
  }, [examId, cameraRequired, microphoneRequired, onSnapshot, onAudioSample, snapshotInterval, audioSampleInterval, captureSnapshot, captureAudioSample]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    // Stop intervals
    if (snapshotIntervalRef.current) {
      clearInterval(snapshotIntervalRef.current);
      snapshotIntervalRef.current = null;
    }
    if (audioSampleIntervalRef.current) {
      clearInterval(audioSampleIntervalRef.current);
      audioSampleIntervalRef.current = null;
    }

    // Stop streams using refs (more reliable than state)
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      cameraStreamRef.current = null;
    }
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      microphoneStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setState({
      cameraActive: false,
      microphoneActive: false,
      cameraStream: null,
      microphoneStream: null,
      error: null,
    });
  }, []);

  // Start/stop monitoring based on enabled flag
  useEffect(() => {
    if (enabled) {
      // Use a small delay to ensure video element is ready
      const timer = setTimeout(() => {
        startMonitoring().catch((error) => {
          console.error('Error starting monitoring:', error);
          setState((prev) => ({
            ...prev,
            error: error.message || 'Failed to start monitoring',
          }));
        });
      }, 500);
      
      return () => {
        clearTimeout(timer);
        stopMonitoring();
      };
    } else {
      stopMonitoring();
      return undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]); // Only depend on enabled - startMonitoring and stopMonitoring are stable callbacks

  return {
    ...state,
    videoRef,
    startMonitoring,
    stopMonitoring,
    captureSnapshot,
    captureAudioSample,
  };
}

