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
} from '@mui/icons-material';
import WebSettingsManager from '@/lib/WebSettingsManager';

// --- Constants for Settings ---
const PLAYBACK_RATES = WebSettingsManager.getValue('playback_speeds') || [0.5, 0.75, 1.0, 1.25, 1.5, 2.0] ;
const DEFAULT_PLAYBACK_RATE = PLAYBACK_RATES[0] || 1.0;
const AUTO_QUALITY_LABEL = 'Auto';
const HORIZONTAL_SEEK_SENSITIVITY = 3;
const ALWAYS_ON_PROGRESS_BAR_HEIGHT = '3px';

// --- Styled Components ---

// MODIFIED: Removed tabIndex and focus outline, no longer needed for keyboard events
const PlayerWrapper = styled('div')({
  width: '100%',
  position: 'relative',
});

const PlayerContainer = styled(Card)(({ theme, isFullscreen }) => ({
  width: '100%',
  maxWidth: isFullscreen ? '100vw' : '1200px',
  aspectRatio: '16 / 9',
  backgroundColor: 'black',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  ...(isFullscreen && {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    zIndex: theme.zIndex.modal,
    borderRadius: 0,
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
});

const FeedbackAnimation = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  color: 'white',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  borderRadius: '16px',
  padding: theme.spacing(1, 2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  zIndex: 5,
  minWidth: '120px',
}));

const ControlsOverlay = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isFullscreen',
})(({ theme, isFullscreen }) => ({
  position: 'absolute',
  bottom: isFullscreen ? ALWAYS_ON_PROGRESS_BAR_HEIGHT : 0,
  left: 0,
  right: 0,
  padding: theme.spacing(1, 2, 2, 2),
  zIndex: 3,
  color: 'white',
  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
}));

const ControlPanel = styled(Card)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  marginTop: theme.spacing(1),
}));

const PersistentProgressBarContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  height: ALWAYS_ON_PROGRESS_BAR_HEIGHT,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  zIndex: 2,
  cursor: 'pointer',
}));

const PersistentProgressBarGauge = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  transformOrigin: 'left',
  backgroundColor: theme.palette.primary.main,
  transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
}));

const VolumeSliderContainer = styled(Box)(({ theme }) => ({
  height: 120,
  padding: theme.spacing(2, 0),
  display: 'flex',
  justifyContent: 'center',
}));


// --- Helper Functions ---
const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds) || timeInSeconds === Infinity) return '00:00';
  const time = Math.round(timeInSeconds);
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const formatScrubTime = (timeInSeconds) => {
  const sign = timeInSeconds >= 0 ? '+' : '-';
  return `${sign}${formatTime(Math.abs(timeInSeconds))}`;
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
  const isMouseOverRef = useRef(false); // NEW: To track if mouse is over the player

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(true);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scrubTime, setScrubTime] = useState(null);

  // Settings state
  const [playbackRate, setPlaybackRate] = useState(DEFAULT_PLAYBACK_RATE);
  const [availableQualities, setAvailableQualities] = useState([]);
  const [selectedQualityId, setSelectedQualityId] = useState(null);
  const [qualityMenuAnchorEl, setQualityMenuAnchorEl] = useState(null);
  const [rateMenuAnchorEl, setRateMenuAnchorEl] = useState(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeSliderAnchorEl, setVolumeSliderAnchorEl] = useState(null);

  // Gesture & Feedback state
  const [seekFeedback, setSeekFeedback] = useState({ active: false, type: '' });
  const [scrubFeedback, setScrubFeedback] = useState({ active: false, timeOffset: 0 });
  const [volumeFeedback, setVolumeFeedback] = useState({ active: false, level: 0 });
  const [screenshotFeedback, setScreenshotFeedback] = useState({ active: false });

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

    player.addEventListener('error', (event) => {
      console.error('Shaka Error:', event.detail);
      setError(`Error: ${event.detail.message} (Code: ${event.detail.code})`);
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
          request.uris[0] += signatureSuffix;
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

    player
      .load(pwMPDUrl)
      .then(() => setIsBuffering(false))
      .catch((err) => {
        if (err.code !== shaka.util.Error.Code.LOAD_INTERRUPTED) {
          setError(`Failed to load video: ${err.message}`);
        }
      });

    return () => {
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [pwMPDUrl, drmKey, licenseUrl, licenseAuthToken, clientId]);

  const triggerVolumeFeedback = useCallback((level, muted) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setVolumeFeedback({ active: true, level: muted ? 0 : level });
    feedbackTimeoutRef.current = setTimeout(() => {
      setVolumeFeedback({ active: false, level: 0 });
    }, 1500);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume;
    video.muted = isMuted;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      if (scrubTime === null) {
        setCurrentTime(video.currentTime);
      }
    };
    const onDurationChange = () => setDuration(video.duration);
    const onRateChange = () => setPlaybackRate(video.playbackRate);
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('ratechange', onRateChange);
    video.addEventListener('volumechange', onVolumeChange);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('ratechange', onRateChange);
      video.removeEventListener('volumechange', onVolumeChange);
    };
  }, [scrubTime, volume, isMuted]);

  useEffect(() => {
    const handleFullscreenChange = () => {
        const isCurrentlyFullscreen = !!document.fullscreenElement;
        setIsFullscreen(isCurrentlyFullscreen);
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const scheduleHideControls = useCallback(() => {
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && isFullscreen) {
        setShowControls(false);
        setQualityMenuAnchorEl(null);
        setRateMenuAnchorEl(null);
        setVolumeSliderAnchorEl(null);
      }
    }, 4000);
  }, [isPlaying, isFullscreen]);

  useEffect(() => {
    if (isFullscreen) {
      if (showControls) {
        scheduleHideControls();
      }
    } else {
      setShowControls(true);
      clearTimeout(controlsTimeoutRef.current);
    }
  }, [showControls, isFullscreen, scheduleHideControls]);

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play().catch(console.error);
    scheduleHideControls();
  }, [isPlaying, scheduleHideControls]);

  const handleSeek = useCallback((offset) => {
    if (!videoRef.current || !duration) return;
    videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + offset));
  }, [duration]);

  const triggerSeekFeedback = useCallback((type) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setSeekFeedback({ active: true, type });
    feedbackTimeoutRef.current = setTimeout(() => setSeekFeedback({ active: false, type: '' }), 500);
  }, []);

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
      if (tapX < rect.width / 2) {
        handleSeek(-10);
        triggerSeekFeedback('backward');
      } else {
        handleSeek(10);
        triggerSeekFeedback('forward');
      }
      lastTapTimeRef.current = 0;
    } else {
      setShowControls((s) => !s);
    }
  }, [handleSeek, triggerSeekFeedback]);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1 && duration > 0) {
      const touch = e.touches[0];
      gestureRef.current = {
        type: null,
        startX: touch.clientX,
        startTime: videoRef.current.currentTime,
        didScrub: false,
      };
      clearTimeout(controlsTimeoutRef.current);
    }
  }, [duration]);

  const handleTouchMove = useCallback((e) => {
    if (!gestureRef.current.startX || e.touches.length !== 1) return;

    e.preventDefault();
    const touch = e.touches[0];
    const deltaX = touch.clientX - gestureRef.current.startX;

    if (!gestureRef.current.type && Math.abs(deltaX) > 10) {
      gestureRef.current.type = 'scrub';
    }

    if (gestureRef.current.type === 'scrub') {
      const rect = containerRef.current.getBoundingClientRect();
      const seekRange = Math.min(duration, 300);
      const timeOffset = (deltaX / (rect.width * HORIZONTAL_SEEK_SENSITIVITY)) * seekRange;
      
      const newPreviewTime = Math.max(0, Math.min(duration, gestureRef.current.startTime + timeOffset));
      setScrubTime(newPreviewTime);
      setScrubFeedback({ active: true, timeOffset });
    }
  }, [duration]);

  const handleTouchEnd = useCallback(() => {
    if (gestureRef.current.type === 'scrub' && scrubTime !== null) {
      if (videoRef.current) {
        videoRef.current.currentTime = scrubTime;
      }
      gestureRef.current.didScrub = true;
    }
    setScrubTime(null);
    gestureRef.current.type = null;
    setTimeout(() => setScrubFeedback({ active: false, timeOffset: 0 }), 500);
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

  // --- Keyboard, Volume, and Screenshot Handlers ---

  const handleVolumeChange = useCallback((delta) => {
    if (!videoRef.current) return;
    const newVolume = Math.max(0, Math.min(1, videoRef.current.volume + delta));
    videoRef.current.volume = newVolume;
    videoRef.current.muted = false;
    triggerVolumeFeedback(newVolume, false);
  }, [triggerVolumeFeedback]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const newMuted = !videoRef.current.muted;
    videoRef.current.muted = newMuted;
    triggerVolumeFeedback(videoRef.current.volume, newMuted);
  }, [triggerVolumeFeedback]);

  const handleScreenshot = useCallback(async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    setScreenshotFeedback({ active: true });
    feedbackTimeoutRef.current = setTimeout(() => {
      setScreenshotFeedback({ active: false });
    }, 1500);

    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      await navigator.clipboard.write([ new ClipboardItem({ 'image/png': blob }) ]);
      console.log('Screenshot copied to clipboard.');
    } catch (err) {
      console.error('Failed to copy screenshot to clipboard:', err);
    }

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    const time = formatTime(video.currentTime).replace(/:/g, '-');
    link.download = `screenshot-${time}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // MODIFIED: This useEffect now attaches to the document to work in fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only respond if the mouse is over the player or if it's in fullscreen.
      // This prevents multiple players on a page from all responding.
      if (!isMouseOverRef.current && !document.fullscreenElement) {
        return;
      }

      const { key, target } = e;
      // Ignore keyboard events when focused on an input field
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      
      const keyMap = {
        ' ': togglePlayPause,
        'f': handleFullscreenToggle,
        'm': toggleMute,
        's': handleScreenshot,
      };

      if (keyMap[key.toLowerCase()]) {
        e.preventDefault();
        keyMap[key.toLowerCase()]();
      } else if (key === 'ArrowRight') {
        e.preventDefault();
        handleSeek(5);
        triggerSeekFeedback('forward');
      } else if (key === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(-5);
        triggerSeekFeedback('backward');
      } else if (key === 'ArrowUp') {
        e.preventDefault();
        handleVolumeChange(0.1);
      } else if (key === 'ArrowDown') {
        e.preventDefault();
        handleVolumeChange(-0.1);
      }
    };

    // Attach listener to the document
    document.addEventListener('keydown', handleKeyDown);
    // Cleanup listener when the component unmounts
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, handleFullscreenToggle, toggleMute, handleSeek, triggerSeekFeedback, handleVolumeChange, handleScreenshot]);


  const displayTime = scrubTime !== null ? scrubTime : currentTime;

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

        {/* --- Status & Feedback Overlays --- */}
        <Fade in={isBuffering && !error}>
          <Box sx={{ position: 'absolute', zIndex: 10, color: 'white' }}>
            <CircularProgress color="inherit" />
          </Box>
        </Fade>
        {error && (
          <Box sx={{ position: 'absolute', p: 2, zIndex: 10 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
        <Fade in={seekFeedback.active}>
          <FeedbackAnimation sx={{ left: seekFeedback.type === 'forward' ? 'auto' : '15%', right: seekFeedback.type === 'forward' ? '15%' : 'auto' }}>
            {seekFeedback.type === 'forward' ? <Forward10 fontSize="large" /> : <Replay10 fontSize="large" />}
          </FeedbackAnimation>
        </Fade>
        <Fade in={scrubFeedback.active}>
          <FeedbackAnimation>
            <Typography variant="h5" component="p">{formatScrubTime(scrubFeedback.timeOffset)}</Typography>
          </FeedbackAnimation>
        </Fade>
        <Fade in={volumeFeedback.active}>
          <FeedbackAnimation>
            {volumeFeedback.level === 0 ? <VolumeOff fontSize="large" /> : <VolumeUp fontSize="large" />}
            <Typography variant="h5" component="p" sx={{ ml: 1, minWidth: '50px' }}>
              {`${Math.round(volumeFeedback.level * 100)}%`}
            </Typography>
          </FeedbackAnimation>
        </Fade>
        <Fade in={screenshotFeedback.active}>
          <FeedbackAnimation>
            <CameraAlt fontSize="large" />
            <Typography variant="h6" component="p" sx={{ ml: 1 }}>
              Saved
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

        {/* --- Always-on progress bar for fullscreen --- */}
        {isFullscreen && !error && (
          <PersistentProgressBarContainer onClick={handlePersistentProgressClick}>
            <PersistentProgressBarGauge
              style={{ transform: `scaleX(${duration ? currentTime / duration : 0})` }}
            />
          </PersistentProgressBarContainer>
        )}

        {/* --- Primary On-Video Controls --- */}
        <Fade in={showControls && !error}>
          <ControlsOverlay isFullscreen={isFullscreen}>
            <Slider
              aria-label="Video Progress"
              value={duration ? (displayTime / duration) * 100 : 0}
              onChange={handleProgressChange}
              sx={{
                color: 'rgba(255, 255, 255, 0.87)',
                '& .MuiSlider-thumb': { '&:hover, &.Mui-focusVisible': { boxShadow: '0px 0px 0px 8px rgba(255, 255, 255, 0.16)' } },
                '& .MuiSlider-rail': { opacity: 0.28 },
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <IconButton aria-label={isPlaying ? 'Pause' : 'Play'} onClick={togglePlayPause} color="inherit">
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton aria-label="Volume" onClick={(e) => setVolumeSliderAnchorEl(e.currentTarget)} color="inherit">
                {isMuted || volume === 0 ? <VolumeOff /> : volume < 0.5 ? <VolumeDown /> : <VolumeUp />}
              </IconButton>
              <Typography variant="body2" sx={{ ml: 1, minWidth: '90px' }}>
                {formatTime(displayTime)} / {formatTime(duration)}
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <IconButton aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'} onClick={handleFullscreenToggle} color="inherit">
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Box>
          </ControlsOverlay>
        </Fade>
      </PlayerContainer>

      {/* --- External Secondary Control Panel --- */}
      <Fade in={(!isFullscreen || showControls) && !error}>
        <ControlPanel>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', gap: { xs: 0, sm: 1 } }}>
            <Button variant="text" color="inherit" startIcon={<QualityIcon />} onClick={(e) => setQualityMenuAnchorEl(e.currentTarget)} sx={{ textTransform: 'none', color: 'text.secondary' }}>
              {selectedQualityId === null ? AUTO_QUALITY_LABEL : `${availableQualities.find((q) => q.id === selectedQualityId)?.height}p`}
            </Button>
            <Button variant="text" color="inherit" startIcon={<SpeedIcon />} onClick={(e) => setRateMenuAnchorEl(e.currentTarget)} sx={{ textTransform: 'none', color: 'text.secondary' }}>
              {playbackRate === 1.0 ? 'Speed' : `${playbackRate}x`}
            </Button>
          </Box>
        </ControlPanel>
      </Fade>

      {/* --- Settings Menus & Popovers --- */}
      <Menu anchorEl={qualityMenuAnchorEl} open={Boolean(qualityMenuAnchorEl)} onClose={() => setQualityMenuAnchorEl(null)}>
        <MenuItem onClick={() => handleQualityChange(null)} selected={selectedQualityId === null}>{AUTO_QUALITY_LABEL}</MenuItem>
        {availableQualities.map((track) => (
          <MenuItem key={track.id} onClick={() => handleQualityChange(track)} selected={selectedQualityId === track.id}>{track.height}p</MenuItem>
        ))}
      </Menu>
      <Menu anchorEl={rateMenuAnchorEl} open={Boolean(rateMenuAnchorEl)} onClose={() => setRateMenuAnchorEl(null)}>
        {PLAYBACK_RATES.map((rate) => (
          <MenuItem key={rate} onClick={() => handleRateChange(rate)} selected={playbackRate === rate}>{rate === 1.0 ? 'Normal' : `${rate}x`}</MenuItem>
        ))}
      </Menu>
      <Popover
        open={Boolean(volumeSliderAnchorEl)}
        anchorEl={volumeSliderAnchorEl}
        onClose={() => setVolumeSliderAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        PaperProps={{ sx: { backgroundColor: 'rgba(40, 40, 40, 0.85)', backdropFilter: 'blur(4px)', color: 'white', borderRadius: '16px', overflow: 'hidden' } }}
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
            sx={{ color: 'white' }}
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
