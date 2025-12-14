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

        setIsInitialized(true);

        // Start periodic face detection using existing video stream
        const detectFaces = async () => {
          if (!faceDetectorRef.current || !videoRef.current) return;
          
          const video = videoRef.current;
          
          // Check if video is ready and has a valid stream
          if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
            try {
              // Send the video frame directly to face detector
              // MediaPipe can work with video elements directly
              await faceDetectorRef.current.send({ image: video });
            } catch (error) {
              console.error('Error detecting faces:', error);
            }
          }
        };

        // Start detection interval
        detectionIntervalRef.current = setInterval(detectFaces, detectionInterval);

        // Do an initial detection after a short delay to ensure video is ready
        setTimeout(detectFaces, 1000);
      } catch (error) {
        console.error('Failed to initialize face detection:', error);
      }
    };

    initializeFaceDetection();

    return () => {
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

