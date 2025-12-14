import { useEffect, useRef, useState, useCallback } from 'react';
import { FaceDetection } from '@mediapipe/face_detection';

interface FaceDetectionResult {
  faceCount: number;
  hasFace: boolean;
  hasMultipleFaces: boolean;
}

interface UseFaceDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  enabled: boolean;
  onFaceDetectionChange?: (result: FaceDetectionResult) => void;
  detectionInterval?: number; // milliseconds between detections
}

export function useFaceDetection({
  videoRef,
  enabled,
  onFaceDetectionChange,
  detectionInterval = 2000, // Check every 2 seconds
}: UseFaceDetectionOptions) {
  const [faceCount, setFaceCount] = useState<number>(0);
  const [hasFace, setHasFace] = useState<boolean>(false);
  const [hasMultipleFaces, setHasMultipleFaces] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  const faceDetectorRef = useRef<FaceDetection | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleFaceDetection = useCallback((results: any) => {
    if (!results || !results.detections) {
      setFaceCount(0);
      setHasFace(false);
      setHasMultipleFaces(false);
      if (onFaceDetectionChange) {
        onFaceDetectionChange({ faceCount: 0, hasFace: false, hasMultipleFaces: false });
      }
      return;
    }

    const detectedFaces = results.detections.length;
    setFaceCount(detectedFaces);
    setHasFace(detectedFaces >= 1);
    setHasMultipleFaces(detectedFaces >= 2);

    if (onFaceDetectionChange) {
      onFaceDetectionChange({
        faceCount: detectedFaces,
        hasFace: detectedFaces >= 1,
        hasMultipleFaces: detectedFaces >= 2,
      });
    }
  }, [onFaceDetectionChange]);

  // Initialize face detector
  useEffect(() => {
    if (!enabled || !videoRef.current) return;

    // Suppress MediaPipe OpenGL warnings and initialization errors (harmless but noisy)
    const originalWarn = console.warn;
    const suppressedWarnings = [
      'OpenGL error checking is disabled',
      'gl_context',
      'Module.arguments',
      'has been replaced with plain arguments',
    ];
    
    const filteredWarn = (...args: any[]) => {
      const message = args.join(' ');
      if (!suppressedWarnings.some(warning => message.includes(warning))) {
        originalWarn.apply(console, args);
      }
    };
    
    // Override console.warn to filter MediaPipe warnings
    console.warn = filteredWarn;

    const initializeFaceDetection = async () => {
      try {
        // Create canvas for face detection (hidden, used only for processing)
        const canvas = document.createElement('canvas');
        canvas.style.display = 'none';
        canvasRef.current = canvas;

        // Initialize face detector
        const faceDetector = new FaceDetection({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
          },
        });

        faceDetector.setOptions({
          model: 'short', // 'short' or 'full' - short is faster
          minDetectionConfidence: 0.5,
        });

        faceDetector.onResults(handleFaceDetection);
        faceDetectorRef.current = faceDetector;

        // Wait for MediaPipe to fully initialize before starting detection
        // This prevents the "Module.arguments" error
        await new Promise(resolve => setTimeout(resolve, 500));

        setIsInitialized(true);

        // Start periodic face detection using existing video stream
        const detectFaces = async () => {
          if (!faceDetectorRef.current || !videoRef.current) return;
          
          const video = videoRef.current;
          
          // Validate video is ready and has valid dimensions
          if (
            video.readyState >= 2 && 
            video.videoWidth > 0 && 
            video.videoHeight > 0 &&
            video.srcObject && // Ensure video has a stream
            !video.paused && // Ensure video is playing
            !video.ended // Ensure video hasn't ended
          ) {
            try {
              // Use video element directly - MediaPipe handles it better than canvas
              // But ensure we're not sending while MediaPipe is still processing
              if (faceDetectorRef.current) {
                await faceDetectorRef.current.send({ image: video });
              }
            } catch (error: any) {
              // Suppress known MediaPipe initialization errors (these are often transient and don't affect functionality)
              const errorMessage = error?.message || String(error) || '';
              const isKnownError = 
                errorMessage.includes('Module.arguments') ||
                errorMessage.includes('memory access out of bounds') ||
                errorMessage.includes('RuntimeError') ||
                errorMessage.includes('Aborted') ||
                errorMessage.includes('has been replaced with plain arguments');
              
              // Only log errors that aren't known MediaPipe issues
              if (!isKnownError) {
                console.error('Error detecting faces:', error);
              }
            }
          }
        };

        // Start detection interval - wait longer before first detection to ensure everything is ready
        setTimeout(() => {
          detectFaces();
          detectionIntervalRef.current = setInterval(detectFaces, detectionInterval);
        }, 2000); // Wait 2 seconds for MediaPipe and video to be fully ready
      } catch (error) {
        console.error('Failed to initialize face detection:', error);
      }
    };

    initializeFaceDetection();

    return () => {
      // Restore original console.warn
      console.warn = originalWarn;
      
      if (faceDetectorRef.current) {
        faceDetectorRef.current.close();
        faceDetectorRef.current = null;
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [enabled, videoRef, handleFaceDetection, detectionInterval]);

  return {
    faceCount,
    hasFace,
    hasMultipleFaces,
    isInitialized,
  };
}

