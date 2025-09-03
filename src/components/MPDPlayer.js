import React, { useEffect, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import {
  Box,
  Card,
  Slider,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Fade,
  styled,
  Button,
  Popover,
  Tooltip,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Fullscreen,
  FullscreenExit,
  Replay10,
  Forward10,
  Speed as SpeedIcon,
  HighQuality as QualityIcon,
  VolumeUp,
  VolumeDown,
  VolumeOff,
  CameraAlt,
  Replay,
  FastForward,
} from '@mui/icons-material';
import WebSettingsManager from '@/lib/WebSettingsManager';

// --- Constants for Settings ---
const PLAYBACK_RATES = WebSettingsManager.getValue('playback_speeds') || [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
const DEFAULT_PLAYBACK_RATE = PLAYBACK_RATES.find(rate => rate === 1.0) || 1.0;
const AUTO_QUALITY_LABEL = 'Auto';
const HORIZONTAL_SEEK_SENSITIVITY = 2;
const ALWAYS_ON_PROGRESS_BAR_HEIGHT = '4px';
const SEEK_STEP = 5; // seconds - base seek step
const VOLUME_STEP = 0.05; // 5% steps
const CONTINUOUS_SEEK_ACCELERATION_TIME = 1000; // ms before acceleration kicks in
const MAX_SEEK_MULTIPLIER = 6; // maximum seek speed multiplier
const SEEK_GESTURE_DELAY = 500; // ms to prevent control flicker during rapid seeking

// --- Styled Components ---

const PlayerWrapper = styled('div')({
  width: '100%',
  position: 'relative',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  '&:focus, &:focus-visible, &:active': {
    outline: 'none',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  },
  userSelect: 'none',
  '-webkit-user-select': 'none',
  '-moz-user-select': 'none',
  '-ms-user-select': 'none',
});

const PlayerContainer = styled(Card)(({ theme, isFullscreen }) => ({
  width: '100%',
  maxWidth: isFullscreen ? '100vw' : '1200px',
  aspectRatio: '16 / 9',
  backgroundColor: '#000',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  borderRadius: isFullscreen ? 0 : '12px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:focus, &:focus-visible, &:active, &:focus-within': {
    outline: 'none !important',
    boxShadow: 'none !important',
  },
  '&.MuiCard-root': {
    '&:focus, &:focus-visible, &:active': {
      outline: 'none',
      boxShadow: 'none',
    },
  },
  '& .MuiTouchRipple-root': {
    display: 'none',
  },
  userSelect: 'none',
  '-webkit-user-select': 'none',
  '-webkit-tap-highlight-color': 'transparent',
  ...(isFullscreen && {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    zIndex: theme.zIndex.modal,
    aspectRatio: 'unset',
  }),
}));

const GestureLayer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
  '&:focus, &:focus-visible, &:active': {
    outline: 'none',
    backgroundColor: 'transparent',
  },
  '-webkit-tap-highlight-color': 'transparent',
  userSelect: 'none',
  '-webkit-user-select': 'none',
});

const FeedbackAnimation = styled(Box)(({ theme, variant = 'default' }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: 'white',
  backgroundColor: variant === 'seek' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.8)',
  borderRadius: variant === 'seek' ? '24px' : '16px',
  padding: variant === 'seek' ? theme.spacing(2.5, 4) : theme.spacing(1.5, 2.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  zIndex: 5,
  minWidth: variant === 'seek' ? '200px' : '120px',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
}));

const ControlsOverlay = styled(Box)(({ theme, isFullscreen, isTouching }) => ({
  position: 'absolute',
  bottom: isFullscreen ? ALWAYS_ON_PROGRESS_BAR_HEIGHT : 0,
  left: 0,
  right: 0,
  padding: theme.spacing(2, 3, 3, 3),
  zIndex: 3,
  color: 'white',
  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)',
  transition: isTouching ? 'none' : 'opacity 0.3s ease-in-out',
  pointerEvents: 'auto',
}));

const ControlPanel = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  marginTop: theme.spacing(1.5),
  backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f8f9fa',
  borderRadius: '12px',
  border: `1px solid ${theme.palette.divider}`,
}));

const PersistentProgressBarContainer = styled(Box)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  height: ALWAYS_ON_PROGRESS_BAR_HEIGHT,
  backgroundColor: 'rgba(255, 255, 255, 0.25)',
  zIndex: 2,
  cursor: 'pointer',
  '&:hover': {
    height: '8px',
    transition: 'height 0.2s ease',
  },
});

const PersistentProgressBarGauge = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  transformOrigin: 'left',
  backgroundColor: theme.palette.primary.main,
  transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    right: 0,
    top: 0,
    width: '2px',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '1px',
  },
}));

// Enhanced progress bar with buffer indicator
const EnhancedSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.primary.main,
  height: 6,
  padding: '16px 0',
  '& .MuiSlider-track': {
    border: 'none',
    height: 6,
    borderRadius: 3,
  },
  '& .MuiSlider-rail': {
    opacity: 0.3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    height: 6,
    borderRadius: 3,
  },
  '& .MuiSlider-thumb': {
    height: 20,
    width: 20,
    backgroundColor: '#fff',
    border: `2px solid ${theme.palette.primary.main}`,
    opacity: 0,
    transition: 'opacity 0.2s ease',
    '&:hover, &.Mui-focusVisible': {
      opacity: 1,
      boxShadow: `0px 0px 0px 8px rgba(255, 255, 255, 0.16)`,
    },
    '&.Mui-active': {
      opacity: 1,
      boxShadow: `0px 0px 0px 12px rgba(255, 255, 255, 0.16)`,
    },
  },
  '&:hover .MuiSlider-thumb': {
    opacity: 1,
  },
}));

// Buffer progress indicator
const BufferProgressBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: 0,
  height: 6,
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  borderRadius: 3,
  transform: 'translateY(-50%)',
  zIndex: 1,
}));

const VolumeSliderContainer = styled(Box)(({ theme }) => ({
  height: 140,
  padding: theme.spacing(2, 1.5),
  display: 'flex',
  justifyContent: 'center',
  backgroundColor: 'rgba(40, 40, 40, 0.95)',
  backdropFilter: 'blur(16px)',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

const ControlButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  padding: theme.spacing(1),
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    transform: 'scale(1.05)',
  },
  '&:active': {
    transform: 'scale(0.95)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  '&:focus': {
    outline: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  '&:focus-visible': {
    outline: '2px solid rgba(255, 255, 255, 0.5)',
    outlineOffset: '2px',
  },
  '& .MuiTouchRipple-root': {
    display: 'none',
  },
  '-webkit-tap-highlight-color': 'transparent',
}));

// Loading spinner for seeking
const SeekingSpinner = styled(CircularProgress)(({ theme }) => ({
  color: 'white',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 6,
}));

// --- Helper Functions ---
const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds) || timeInSeconds === Infinity) return '00:00';
  const time = Math.round(timeInSeconds);
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const formatSeekTime = (timeInSeconds, isOffset = false) => {
  if (isOffset) {
    const sign = timeInSeconds >= 0 ? '+' : '';
    return `${sign}${Math.round(timeInSeconds)}s`;
  }
  return formatTime(timeInSeconds);
};

// Calculate seek step multiplier based on time held
const getSeekMultiplier = (timeHeld) => {
  if (timeHeld < CONTINUOUS_SEEK_ACCELERATION_TIME) return 1;
  return Math.min(
    MAX_SEEK_MULTIPLIER,
    1 + Math.floor((timeHeld - CONTINUOUS_SEEK_ACCELERATION_TIME) / 1000)
  );
};

// --- Main Player Component ---

const MPDPlayer = ({
  pwMPDUrl,
  drmKey,
  licenseUrl,
  licenseAuthToken,
  clientId,
}) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const lastTapTimeRef = useRef(0);
  const gestureRef = useRef({ type: null, startX: 0, startTime: 0, didScrub: false });
  const feedbackTimeoutRef = useRef(null);
  const isMouseOverRef = useRef(false);
  const progressHoverRef = useRef(false);
  const seekGestureTimeoutRef = useRef(null);

  // Enhanced seeking refs
  const seekingRef = useRef({ 
    isActive: false, 
    direction: null, 
    startTime: 0, 
    targetTime: 0,
    lastSeekTime: 0,
    currentMultiplier: 1
  });
  const seekIntervalRef = useRef(null);

  // Touch state tracking
  const touchStateRef = useRef({
    isTouching: false,
    preventControlsHide: false,
  });

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [isBuffering, setIsBuffering] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrubTime, setScrubTime] = useState(null);
  const [isSeekingGesture, setIsSeekingGesture] = useState(false);

  // Page visibility and recovery state
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  const [shouldReload, setShouldReload] = useState(false);

  // Unified loading state
  const [loadingState, setLoadingState] = useState({
    type: null, // 'buffering', 'seeking', 'scrubbing', 'continuous-seeking'
    active: false
  });

  // Settings state
  const [playbackRate, setPlaybackRate] = useState(DEFAULT_PLAYBACK_RATE);
  const [availableQualities, setAvailableQualities] = useState([]);
  const [selectedQualityId, setSelectedQualityId] = useState(null);
  const [qualityMenuAnchorEl, setQualityMenuAnchorEl] = useState(null);
  const [rateMenuAnchorEl, setRateMenuAnchorEl] = useState(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeSliderAnchorEl, setVolumeSliderAnchorEl] = useState(null);

  // Enhanced feedback state
  const [seekFeedback, setSeekFeedback] = useState({ active: false, type: '', time: 0, multiplier: 1 });
  const [scrubFeedback, setScrubFeedback] = useState({ active: false, time: 0 });
  const [volumeFeedback, setVolumeFeedback] = useState({ active: false, level: 0, muted: false });
  const [screenshotFeedback, setScreenshotFeedback] = useState({ active: false });

  // Enhanced seek feedback state
  const [continuousSeekFeedback, setContinuousSeekFeedback] = useState({ 
    active: false, 
    type: '', 
    targetTime: 0,
    multiplier: 1,
    isSmooth: false 
  });

  // Unified loading state management - prioritize seek feedback over generic seeking
  useEffect(() => {
    if (scrubFeedback.active) {
      setLoadingState({ type: 'scrubbing', active: true });
    } else if (continuousSeekFeedback.active) {
      setLoadingState({ type: 'continuous-seeking', active: true });
    } else if (seekFeedback.active) {
      // When seek feedback is active, don't show the generic seeking spinner
      setLoadingState({ type: 'seek-feedback', active: false });
    } else if (isSeeking) {
      setLoadingState({ type: 'seeking', active: true });
    } else if (isBuffering) {
      setLoadingState({ type: 'buffering', active: true });
    } else {
      setLoadingState({ type: null, active: false });
    }
  }, [scrubFeedback.active, continuousSeekFeedback.active, seekFeedback.active, isSeeking, isBuffering]);

  // Page visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsPageVisible(isVisible);
      
      if (!isVisible) {
        // Page is going to background - pause video
        if (videoRef.current && isPlaying) {
          videoRef.current.pause();
        }
      } else {
        // Page is coming back to foreground
        if (shouldReload && playerRef.current) {
          // Reload the player after coming back from background
          setTimeout(() => {
            const currentTime = videoRef.current?.currentTime || 0;
            reloadPlayer(currentTime);
            setShouldReload(false);
          }, 100);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying, shouldReload]);

  // Reload player function
  const reloadPlayer = useCallback(async (seekTime = 0) => {
    if (!playerRef.current || !pwMPDUrl) return;
    
    try {
      setIsBuffering(true);
      setError(null);
      
      // Reload the manifest
      await playerRef.current.load(pwMPDUrl);
      
      // Seek back to where we were
      if (seekTime > 0 && videoRef.current) {
        videoRef.current.currentTime = seekTime;
      }
      
      setIsBuffering(false);
    } catch (err) {
      console.error('Failed to reload player:', err);
      if (err.code !== window.shaka?.util.Error.Code.LOAD_INTERRUPTED) {
        setError(`Failed to reload video: ${err.message}`);
      }
    }
  }, [pwMPDUrl]);

  // Load with retry logic
  const loadWithRetry = useCallback(async (url, maxRetries = 3) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await playerRef.current.load(url);
        return; // Success
      } catch (err) {
        lastError = err;
        console.warn(`Load attempt ${attempt} failed:`, err);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    // All retries failed
    throw lastError;
  }, []);

  // --- Core Player & Event Listener Logic ---
  useEffect(() => {
    const shaka = window.shaka;
    if (!shaka) {
      setError('Shaka Player library not loaded.');
      return;
    }
    shaka.polyfill.installAll();
    if (!shaka.Player.isBrowserSupported()) {
      setError('Browser not supported by Shaka Player.');
      return;
    }

    const video = videoRef.current;
    const player = new shaka.Player(video);
    playerRef.current = player;
    setIsBuffering(true);

    // Set crossOrigin for screenshot capability
    video.crossOrigin = 'anonymous';

    player.getNetworkingEngine().registerRequestFilter(function(type, request) {
          request.allowCrossSiteCredentials = true;
      });

    player.addEventListener('error', (event) => {
      console.error('Shaka Error:', event.detail);
      
      // Handle specific error codes that occur after background/foreground
      if (event.detail.code === 1003 || event.detail.code === 3016) {
        console.log('Background recovery error detected, scheduling reload');
        setShouldReload(true);
        
        // If page is currently visible, reload immediately
        if (!document.hidden) {
          const currentTime = videoRef.current?.currentTime || 0;
          setTimeout(() => {
            reloadPlayer(currentTime);
            setShouldReload(false);
          }, 500);
        }
      } else {
        setError(`Error: ${event.detail.message} (Code: ${event.detail.code})`);
      }
    });
    
    player.addEventListener('buffering', (event) => setIsBuffering(event.buffering));

    const updateQualityTracks = () => {
      if (!playerRef.current) return;
      const variantTracks = playerRef.current
        .getVariantTracks()
        .filter((t) => t.height)
        .sort((a, b) => b.height - a.height);
      setAvailableQualities(variantTracks);
      const activeVariant = playerRef.current.getVariantTracks().find((t) => t.active);
      setSelectedQualityId(
        playerRef.current.isAbrEnabled() ? null : activeVariant?.id
      );
    };

    player.addEventListener('trackschanged', updateQualityTracks);
    player.addEventListener('variantchanged', updateQualityTracks);

    const urlParts = pwMPDUrl.split('?');
    const signatureSuffix = urlParts.length > 1 ? `?${urlParts.slice(1).join('?')}` : '';
    const networkingEngine = player.getNetworkingEngine();
    
    
    if (signatureSuffix) {
      networkingEngine.registerRequestFilter((type, request) => {
        if (type === shaka.net.NetworkingEngine.RequestType.SEGMENT) {
          // Ensure we don't double-add the signature
          if (!request.uris[0].includes('?')) {
            request.uris[0] += signatureSuffix;
          }
        }
      });
    }
    
    if (licenseUrl) {
      networkingEngine.registerRequestFilter((type, request) => {
        if (type === shaka.net.NetworkingEngine.RequestType.LICENSE) {
          if (licenseAuthToken) request.headers['Authorization'] = `Bearer ${licenseAuthToken}`;
          if (clientId) {
            request.headers['Client-Id'] = clientId;
            request.headers['Client-Type'] = 'WEB';
          }
        }
      });
    }

    player.configure({
      drm: {
        servers: licenseUrl ? { 'com.widevine.alpha': licenseUrl } : {},
        clearKeys: (drmKey && drmKey.kid && drmKey.key) ? { [drmKey.kid]: drmKey.key } : {},
      },
      streaming: { bufferingGoal: 320, rebufferingGoal: 10 },
      abr: { enabled: true },
    });

    loadWithRetry(pwMPDUrl)
      .then(() => setIsBuffering(false))
      .catch((err) => {
        if (err.code !== shaka.util.Error.Code.LOAD_INTERRUPTED) {
          setError(`Failed to load video: ${err.message}`);
        }
      });

    return () => {
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [pwMPDUrl, drmKey, licenseUrl, licenseAuthToken, clientId, loadWithRetry, reloadPlayer]);

  const triggerVolumeFeedback = useCallback((level, muted) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setVolumeFeedback({ active: true, level, muted });
    feedbackTimeoutRef.current = setTimeout(() => {
      setVolumeFeedback({ active: false, level: 0, muted: false });
    }, 1200);
  }, []);

  // Enhanced buffer tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume;
    video.muted = isMuted;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      if (scrubTime === null && !seekingRef.current.isActive) {
        setCurrentTime(video.currentTime);
      }
    };
    const onDurationChange = () => setDuration(video.duration);
    const onRateChange = () => setPlaybackRate(video.playbackRate);
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const onProgress = () => {
      if (video.buffered.length > 0) {
        setBufferedTime(video.buffered.end(video.buffered.length - 1));
      }
    };
    
    // Only show seeking spinner if no seek feedback is active
    const onSeeking = () => {
      if (!seekFeedback.active) {
        setIsSeeking(true);
      }
    };
    const onSeeked = () => setIsSeeking(false);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('ratechange', onRateChange);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('progress', onProgress);
    video.addEventListener('seeking', onSeeking);
    video.addEventListener('seeked', onSeeked);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('ratechange', onRateChange);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('progress', onProgress);
      video.removeEventListener('seeking', onSeeking);
      video.removeEventListener('seeked', onSeeked);
    };
  }, [scrubTime, volume, isMuted, seekFeedback.active]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Enhanced controls visibility logic
  const scheduleHideControls = useCallback(() => {
    if (touchStateRef.current.preventControlsHide || isSeekingGesture) return;
    
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && isFullscreen && !progressHoverRef.current && !touchStateRef.current.isTouching && !isSeekingGesture) {
        setShowControls(false);
        setQualityMenuAnchorEl(null);
        setRateMenuAnchorEl(null);
        setVolumeSliderAnchorEl(null);
      }
    }, 3500);
  }, [isPlaying, isFullscreen, isSeekingGesture]);

  useEffect(() => {
    if (isFullscreen) {
      if (showControls && !touchStateRef.current.isTouching && !isSeekingGesture) {
        scheduleHideControls();
      }
    } else {
      setShowControls(true);
      clearTimeout(controlsTimeoutRef.current);
    }
  }, [showControls, isFullscreen, isSeekingGesture, scheduleHideControls]);

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play().catch(console.error);
    scheduleHideControls();
  }, [isPlaying, scheduleHideControls]);

  const handleSeek = useCallback((offset) => {
    if (!videoRef.current || !duration) return;
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + offset));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    return newTime;
  }, [duration]);

  const triggerSeekFeedback = useCallback((type, targetTime, multiplier = 1) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setSeekFeedback({ active: true, type, time: targetTime, multiplier });
    
    // Set seeking gesture state to prevent control flickering
    setIsSeekingGesture(true);
    clearTimeout(seekGestureTimeoutRef.current);
    
    feedbackTimeoutRef.current = setTimeout(() => {
      setSeekFeedback({ active: false, type: '', time: 0, multiplier: 1 });
    }, 800);

    seekGestureTimeoutRef.current = setTimeout(() => {
      setIsSeekingGesture(false);
    }, SEEK_GESTURE_DELAY);
  }, []);

  // Enhanced continuous seeking with proper step multiples
  const startContinuousSeeking = useCallback((direction) => {
    if (seekingRef.current.isActive || !videoRef.current || !duration) return;

    const currentVideoTime = videoRef.current.currentTime;
    seekingRef.current = {
      isActive: true,
      direction,
      startTime: Date.now(),
      targetTime: currentVideoTime,
      lastSeekTime: Date.now(),
      currentMultiplier: 1
    };

    setContinuousSeekFeedback({ 
      active: true, 
      type: direction, 
      targetTime: currentVideoTime,
      multiplier: 1,
      isSmooth: true 
    });

    const performSeek = () => {
      if (!seekingRef.current.isActive || !videoRef.current) return;

      const now = Date.now();
      const timeSinceStart = now - seekingRef.current.startTime;
      const timeSinceLastSeek = now - seekingRef.current.lastSeekTime;
      
      // Calculate multiplier based on time held
      const newMultiplier = getSeekMultiplier(timeSinceStart);
      seekingRef.current.currentMultiplier = newMultiplier;

      // Only seek if enough time has passed (throttling)
      const seekInterval = Math.max(100, 300 / newMultiplier); // Faster intervals for higher multipliers
      
      if (timeSinceLastSeek >= seekInterval) {
        const offset = (direction === 'forward' ? SEEK_STEP : -SEEK_STEP) * newMultiplier;
        seekingRef.current.targetTime = Math.max(0, Math.min(duration, seekingRef.current.targetTime + offset));
        seekingRef.current.lastSeekTime = now;

        videoRef.current.currentTime = seekingRef.current.targetTime;
        setCurrentTime(seekingRef.current.targetTime);

        setContinuousSeekFeedback({
          active: true,
          type: direction,
          targetTime: seekingRef.current.targetTime,
          multiplier: newMultiplier,
          isSmooth: true
        });
      }

      seekIntervalRef.current = requestAnimationFrame(performSeek);
    };

    performSeek();
  }, [duration]);

  const stopContinuousSeeking = useCallback(() => {
    if (!seekingRef.current.isActive) return;

    seekingRef.current.isActive = false;
    if (seekIntervalRef.current) {
      cancelAnimationFrame(seekIntervalRef.current);
      seekIntervalRef.current = null;
    }

    setTimeout(() => {
      setContinuousSeekFeedback({ 
        active: false, 
        type: '', 
        targetTime: 0, 
        multiplier: 1, 
        isSmooth: false 
      });
    }, 600);
  }, []);

  // Enhanced container click handler with center region play/pause support and flicker prevention
  const handleContainerClick = useCallback((e) => {
    if (gestureRef.current.didScrub) {
      gestureRef.current.didScrub = false;
      return;
    }
    
    const now = Date.now();
    const isDoubleTap = now - lastTapTimeRef.current < 300;
    lastTapTimeRef.current = now;

    if (isDoubleTap) {
      const rect = containerRef.current.getBoundingClientRect();
      const tapX = e.clientX - rect.left;
      const regionWidth = rect.width / 3;
      
      if (tapX < regionWidth) {
        // Left region - seek backward
        const newTime = handleSeek(-10);
        triggerSeekFeedback('backward', newTime);
      } else if (tapX > rect.width - regionWidth) {
        // Right region - seek forward
        const newTime = handleSeek(10);
        triggerSeekFeedback('forward', newTime);
      } else {
        // Center region - play/pause
        togglePlayPause();
      }
      lastTapTimeRef.current = 0;
    } else {
      // Only toggle controls if not in seeking gesture state
      if (!isSeekingGesture) {
        setShowControls((s) => !s);
      }
    }
  }, [handleSeek, triggerSeekFeedback, togglePlayPause, isSeekingGesture]);

  // Enhanced touch handling to prevent control flickering
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1 && duration > 0) {
      const touch = e.touches[0];
      gestureRef.current = {
        type: null,
        startX: touch.clientX,
        startTime: videoRef.current.currentTime,
        didScrub: false,
      };
      
      // Set touch state and prevent controls from hiding
      touchStateRef.current.isTouching = true;
      touchStateRef.current.preventControlsHide = true;
      clearTimeout(controlsTimeoutRef.current);
      
      // Show controls during touch
      setShowControls(true);
    }
  }, [duration]);

  const handleTouchMove = useCallback((e) => {
    if (!gestureRef.current.startX || e.touches.length !== 1) return;

    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - gestureRef.current.startX;

    if (!gestureRef.current.type && Math.abs(deltaX) > 15) {
      gestureRef.current.type = 'scrub';
    }

    if (gestureRef.current.type === 'scrub') {
      const rect = containerRef.current.getBoundingClientRect();
      const seekRange = Math.min(duration, 600);
      const sensitivity = rect.width * HORIZONTAL_SEEK_SENSITIVITY;
      const timeOffset = (deltaX / sensitivity) * seekRange;

      const newPreviewTime = Math.max(0, Math.min(duration, gestureRef.current.startTime + timeOffset));
      setScrubTime(newPreviewTime);
      setScrubFeedback({ active: true, time: newPreviewTime });
    }
  }, [duration]);

  const handleTouchEnd = useCallback(() => {
    if (gestureRef.current.type === 'scrub' && scrubTime !== null) {
      if (videoRef.current) {
        videoRef.current.currentTime = scrubTime;
        setCurrentTime(scrubTime);
      }
      gestureRef.current.didScrub = true;
    }
    
    setScrubTime(null);
    gestureRef.current.type = null;
    
    // Reset touch state
    touchStateRef.current.isTouching = false;
    setTimeout(() => {
      touchStateRef.current.preventControlsHide = false;
      setScrubFeedback({ active: false, time: 0 });
    }, 400);
    
    // Resume normal control hiding behavior
    scheduleHideControls();
  }, [scrubTime, scheduleHideControls]);

  const handleQualityChange = useCallback((track) => {
    if (playerRef.current) {
      if (track === null) {
        playerRef.current.configure({ abr: { enabled: true } });
      } else {
        playerRef.current.selectVariantTrack(track, true);
        playerRef.current.configure({ abr: { enabled: false } });
      }
    }
    setQualityMenuAnchorEl(null);
  }, []);

  const handleRateChange = useCallback((rate) => {
    if (videoRef.current) videoRef.current.playbackRate = rate;
    setRateMenuAnchorEl(null);
  }, []);

  const handleProgressChange = useCallback((event, newValue) => {
    if (!videoRef.current || !duration) return;
    const newTime = (newValue / 100) * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handlePersistentProgressClick = useCallback((e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const seekRatio = clickX / rect.width;
    const newTime = duration * seekRatio;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  const handleFullscreenToggle = useCallback(() => {
    const elem = containerRef.current;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) elem.requestFullscreen();
      else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  }, []);

  const handleVolumeChange = useCallback((delta) => {
    if (!videoRef.current) return;
    const newVolume = Math.max(0, Math.min(1, videoRef.current.volume + delta));
    videoRef.current.volume = newVolume;
    if (newVolume > 0) videoRef.current.muted = false;
    triggerVolumeFeedback(newVolume, newVolume === 0);
  }, [triggerVolumeFeedback]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const newMuted = !videoRef.current.muted;
    videoRef.current.muted = newMuted;
    triggerVolumeFeedback(videoRef.current.volume, newMuted);
  }, [triggerVolumeFeedback]);

  // Enhanced screenshot function with multiple fallback methods
  const handleScreenshot = useCallback(async () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    let canvas, ctx, success = false;

    // Show feedback immediately
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setScreenshotFeedback({ active: true });

    try {
      // Method 1: Direct canvas capture
      canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || video.clientWidth;
      canvas.height = video.videoHeight || video.clientHeight;
      ctx = canvas.getContext('2d');

      // Wait for video to be ready and try multiple approaches
      await new Promise((resolve) => {
        const tryCapture = () => {
          try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Check if canvas is not blank/black
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            let hasNonBlackPixels = false;
            
            for (let i = 0; i < data.length; i += 4) {
              if (data[i] > 10 || data[i + 1] > 10 || data[i + 2] > 10) {
                hasNonBlackPixels = true;
                break;
              }
            }
            
            if (hasNonBlackPixels) {
              success = true;
              resolve();
            } else {
              throw new Error('Canvas appears to be black');
            }
          } catch (err) {
            console.warn('Screenshot capture attempt failed:', err);
            // Try again after a short delay
            setTimeout(tryCapture, 100);
          }
        };
        
        // Start capture attempts
        tryCapture();
        
        // Fallback timeout
        setTimeout(() => {
          if (!success) {
            console.warn('Using potentially black screenshot as fallback');
            success = true;
            resolve();
          }
        }, 1000);
      });

      // Try to copy to clipboard first
      try {
        const blob = await new Promise(resolve => 
          canvas.toBlob(resolve, 'image/png', 0.95)
        );
        
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          console.log('Screenshot copied to clipboard');
        }
      } catch (clipboardErr) {
        console.warn('Failed to copy to clipboard:', clipboardErr);
      }

      // Always download as fallback
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png', 0.95);
      const time = formatTime(video.currentTime).replace(/:/g, '-');
      link.download = `screenshot-${time}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('Screenshot saved successfully');

    } catch (err) {
      console.error('Screenshot failed:', err);
      
      // Final fallback: try a different approach
      try {
        if (!canvas) {
          canvas = document.createElement('canvas');
          canvas.width = 1280;
          canvas.height = 720;
          ctx = canvas.getContext('2d');
        }
        
        // Fill with a placeholder if all else fails
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Screenshot not available', canvas.width / 2, canvas.height / 2);
        ctx.fillText(`Time: ${formatTime(video.currentTime)}`, canvas.width / 2, canvas.height / 2 + 30);
        
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `screenshot-fallback-${formatTime(video.currentTime).replace(/:/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Fallback screenshot created');
      } catch (fallbackErr) {
        console.error('Even fallback screenshot failed:', fallbackErr);
      }
    }

    feedbackTimeoutRef.current = setTimeout(() => {
      setScreenshotFeedback({ active: false });
    }, 2000);
  }, []);

  // Enhanced keyboard handling with proper seek step multiples
  useEffect(() => {
    let keyPressedMap = {};

    const handleKeyDown = (e) => {
      if (!isMouseOverRef.current && !document.fullscreenElement) {
        return;
      }

      const { key, target } = e;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (keyPressedMap[key]) return;
      keyPressedMap[key] = true;

      const keyMap = {
        ' ': () => { e.preventDefault(); togglePlayPause(); },
        'f': () => { e.preventDefault(); handleFullscreenToggle(); },
        'm': () => { e.preventDefault(); toggleMute(); },
        's': () => { e.preventDefault(); handleScreenshot(); },
      };

      if (keyMap[key.toLowerCase()]) {
        keyMap[key.toLowerCase()]();
      } else if (key === 'ArrowRight') {
        e.preventDefault();
        if (!seekingRef.current.isActive) {
          const newTime = handleSeek(SEEK_STEP);
          triggerSeekFeedback('forward', newTime);
        } else {
          return;
        }
        startContinuousSeeking('forward');
      } else if (key === 'ArrowLeft') {
        e.preventDefault();
        if (!seekingRef.current.isActive) {
          const newTime = handleSeek(-SEEK_STEP);
          triggerSeekFeedback('backward', newTime);
        } else {
          return;
        }
        startContinuousSeeking('backward');
      } else if (key === 'ArrowUp') {
        e.preventDefault();
        handleVolumeChange(VOLUME_STEP);
      } else if (key === 'ArrowDown') {
        e.preventDefault();
        handleVolumeChange(-VOLUME_STEP);
      }
    };

    const handleKeyUp = (e) => {
      const { key } = e;
      keyPressedMap[key] = false;

      if (key === 'ArrowRight' || key === 'ArrowLeft') {
        stopContinuousSeeking();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      stopContinuousSeeking();
      clearTimeout(seekGestureTimeoutRef.current);
    };
  }, [togglePlayPause, handleFullscreenToggle, toggleMute, handleSeek, triggerSeekFeedback, handleVolumeChange, handleScreenshot, startContinuousSeeking, stopContinuousSeeking]);

  const displayTime = scrubTime !== null ? scrubTime : currentTime;
  const bufferProgress = duration ? (bufferedTime / duration) * 100 : 0;

  return (
    <PlayerWrapper
      onMouseEnter={() => { isMouseOverRef.current = true; }}
      onMouseLeave={() => { isMouseOverRef.current = false; }}
    >
      <PlayerContainer ref={containerRef} isFullscreen={isFullscreen}>
        <video
          ref={videoRef}
          playsInline
          preload="metadata"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />

        {/* --- Unified Loading Indicators --- */}
        <Fade in={loadingState.active && loadingState.type === 'buffering'}>
          <Box sx={{ position: 'absolute', zIndex: 10, color: 'white' }}>
            <CircularProgress color="inherit" size={48} thickness={2} />
          </Box>
        </Fade>

        {/* Only show seeking spinner when seek feedback is NOT active */}
        <Fade in={loadingState.active && loadingState.type === 'seeking' && !seekFeedback.active}>
          <SeekingSpinner size={32} thickness={3} />
        </Fade>

        {error && (
          <Box sx={{ position: 'absolute', p: 3, zIndex: 10, maxWidth: '80%' }}>
            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
          </Box>
        )}

        {/* Enhanced Single Seek Feedback */}
        <Fade in={seekFeedback.active}>
          <FeedbackAnimation 
            variant="seek"
            sx={{ 
              left: seekFeedback.type === 'forward' ? '60%' : '40%',
              transform: seekFeedback.type === 'forward' ? 'translate(-40%, -50%)' : 'translate(-60%, -50%)'
            }}
          >
            {seekFeedback.type === 'forward' ? 
              <Forward10 fontSize="large" /> : 
              <Replay10 fontSize="large" />
            }
            <Box sx={{ ml: 1.5, textAlign: 'center' }}>
              <Typography variant="h6" component="p" sx={{ fontWeight: 600 }}>
                {formatTime(seekFeedback.time)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {seekFeedback.type === 'forward' ? `+${SEEK_STEP * seekFeedback.multiplier}s` : `-${SEEK_STEP * seekFeedback.multiplier}s`}
              </Typography>
            </Box>
          </FeedbackAnimation>
        </Fade>

        {/* Enhanced Continuous Seek Feedback */}
        <Fade in={continuousSeekFeedback.active}>
          <FeedbackAnimation variant="seek">
            {continuousSeekFeedback.type === 'forward' ? 
              <FastForward fontSize="large" /> : 
              <Replay fontSize="large" />
            }
            <Box sx={{ ml: 1.5, textAlign: 'center' }}>
              <Typography variant="h6" component="p" sx={{ fontWeight: 600 }}>
                {formatTime(continuousSeekFeedback.targetTime)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {continuousSeekFeedback.multiplier > 1 
                  ? `${continuousSeekFeedback.multiplier}x Speed` 
                  : 'Seeking...'
                }
              </Typography>
            </Box>
          </FeedbackAnimation>
        </Fade>

        {/* Enhanced Scrub Feedback */}
        <Fade in={scrubFeedback.active}>
          <FeedbackAnimation variant="seek">
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" component="p" sx={{ fontWeight: 600 }}>
                {formatTime(scrubFeedback.time)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Scrubbing
              </Typography>
            </Box>
          </FeedbackAnimation>
        </Fade>

        {/* Enhanced Volume Feedback */}
        <Fade in={volumeFeedback.active}>
          <FeedbackAnimation>
            {volumeFeedback.muted || volumeFeedback.level === 0 ? 
              <VolumeOff fontSize="large" /> : 
              volumeFeedback.level < 0.5 ? <VolumeDown fontSize="large" /> : <VolumeUp fontSize="large" />
            }
            <Typography variant="h6" component="p" sx={{ ml: 1.5, minWidth: '60px', fontWeight: 600 }}>
              {volumeFeedback.muted ? 'Muted' : `${Math.round(volumeFeedback.level * 100)}%`}
            </Typography>
          </FeedbackAnimation>
        </Fade>

        {/* Enhanced Screenshot Feedback */}
        <Fade in={screenshotFeedback.active}>
          <FeedbackAnimation>
            <CameraAlt fontSize="large" />
            <Typography variant="h6" component="p" sx={{ ml: 1.5, fontWeight: 600 }}>
              Screenshot Saved
            </Typography>
          </FeedbackAnimation>
        </Fade>

        {/* --- Gesture Handling Layer --- */}
        <GestureLayer
          onClick={handleContainerClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />

        {/* --- Enhanced Always-on progress bar for fullscreen --- */}
        {isFullscreen && !error && (
          <PersistentProgressBarContainer 
            onClick={handlePersistentProgressClick}
            onMouseEnter={() => { progressHoverRef.current = true; }}
            onMouseLeave={() => { progressHoverRef.current = false; }}
          >
            <PersistentProgressBarGauge
              style={{ transform: `scaleX(${duration ? currentTime / duration : 0})` }}
            />
          </PersistentProgressBarContainer>
        )}

        {/* --- Enhanced Primary On-Video Controls --- */}
        <Fade in={showControls && !error}>
          <ControlsOverlay 
            isFullscreen={isFullscreen} 
            isTouching={touchStateRef.current.isTouching}
          >
            <Box sx={{ position: 'relative' }}>
              <EnhancedSlider
                aria-label="Video Progress"
                value={duration ? (displayTime / duration) * 100 : 0}
                onChange={handleProgressChange}
              />
              {/* Buffer progress indicator */}
              <BufferProgressBar
                sx={{
                  width: `${bufferProgress}%`,
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}>
                  <ControlButton onClick={togglePlayPause} size="large">
                    {isPlaying ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
                  </ControlButton>
                </Tooltip>
                
                <Tooltip title="Volume (M to mute)">
                  <ControlButton onClick={(e) => setVolumeSliderAnchorEl(e.currentTarget)}>
                    {isMuted || volume === 0 ? <VolumeOff /> : 
                     volume < 0.5 ? <VolumeDown /> : <VolumeUp />}
                  </ControlButton>
                </Tooltip>

                <Typography variant="body2" sx={{ ml: 1, color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
                  {formatTime(displayTime)} / {formatTime(duration)}
                </Typography>
              </Box>

              <Tooltip title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}>
                <ControlButton onClick={handleFullscreenToggle}>
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </ControlButton>
              </Tooltip>
            </Box>
          </ControlsOverlay>
        </Fade>
      </PlayerContainer>

      {/* --- Enhanced External Secondary Control Panel --- */}
      <Fade in={(!isFullscreen || showControls) && !error}>
        <ControlPanel>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Tooltip title="Take Screenshot (S)">
                <IconButton onClick={handleScreenshot} size="small" sx={{ color: 'text.secondary' }}>
                  <CameraAlt />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button 
                variant="text" 
                color="inherit" 
                startIcon={<QualityIcon />} 
                onClick={(e) => setQualityMenuAnchorEl(e.currentTarget)} 
                sx={{ 
                  textTransform: 'none', 
                  color: 'text.secondary',
                  minWidth: 'auto',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                {selectedQualityId === null ? 
                  AUTO_QUALITY_LABEL : 
                  `${availableQualities.find((q) => q.id === selectedQualityId)?.height}p`
                }
              </Button>
              
              <Button 
                variant="text" 
                color="inherit" 
                startIcon={<SpeedIcon />} 
                onClick={(e) => setRateMenuAnchorEl(e.currentTarget)} 
                sx={{ 
                  textTransform: 'none', 
                  color: 'text.secondary',
                  minWidth: 'auto',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                {playbackRate === 1.0 ? 'Speed' : `${playbackRate}x`}
              </Button>
            </Box>
          </Box>
        </ControlPanel>
      </Fade>

      {/* --- Enhanced Settings Menus & Popovers --- */}
      <Menu 
        anchorEl={qualityMenuAnchorEl} 
        open={Boolean(qualityMenuAnchorEl)} 
        onClose={() => setQualityMenuAnchorEl(null)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 120,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <MenuItem 
          onClick={() => handleQualityChange(null)} 
          selected={selectedQualityId === null}
          sx={{ borderRadius: 1, mx: 0.5 }}
        >
          {AUTO_QUALITY_LABEL}
        </MenuItem>
        {availableQualities.map((track) => (
          <MenuItem 
            key={track.id} 
            onClick={() => handleQualityChange(track)} 
            selected={selectedQualityId === track.id}
            sx={{ borderRadius: 1, mx: 0.5 }}
          >
            {track.height}p
          </MenuItem>
        ))}
      </Menu>

      <Menu 
        anchorEl={rateMenuAnchorEl} 
        open={Boolean(rateMenuAnchorEl)} 
        onClose={() => setRateMenuAnchorEl(null)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 100,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        {PLAYBACK_RATES.map((rate) => (
          <MenuItem 
            key={rate} 
            onClick={() => handleRateChange(rate)} 
            selected={playbackRate === rate}
            sx={{ borderRadius: 1, mx: 0.5 }}
          >
            {rate === 1.0 ? 'Normal' : `${rate}x`}
          </MenuItem>
        ))}
      </Menu>

      <Popover
        open={Boolean(volumeSliderAnchorEl)}
        anchorEl={volumeSliderAnchorEl}
        onClose={() => setVolumeSliderAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        PaperProps={{ 
          sx: { 
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible'
          } 
        }}
      >
        <VolumeSliderContainer>
          <Slider
            orientation="vertical"
            value={isMuted ? 0 : volume * 100}
            onChange={(e, newValue) => {
              if (!videoRef.current) return;
              const newVol = newValue / 100;
              videoRef.current.volume = newVol;
              videoRef.current.muted = newVol === 0;
            }}
            sx={{ 
              color: 'white',
              '& .MuiSlider-thumb': {
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: '0px 0px 0px 8px rgba(255, 255, 255, 0.16)',
                },
              },
            }}
          />
        </VolumeSliderContainer>
      </Popover>
    </PlayerWrapper>
  );
};

MPDPlayer.propTypes = {
  pwMPDUrl: PropTypes.string.isRequired,
  drmKey: PropTypes.shape({
    kid: PropTypes.string,
    key: PropTypes.string,
  }),
  licenseUrl: PropTypes.string,
  licenseAuthToken: PropTypes.string,
  clientId: PropTypes.string,
};

MPDPlayer.defaultProps = {
  drmKey: null,
  licenseUrl: null,
  licenseAuthToken: null,
  clientId: null,
};

export default MPDPlayer;