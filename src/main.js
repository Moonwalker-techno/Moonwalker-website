/* ==========================================================================
   MOONWALKER SITE LOGIC & WEB AUDIO ENGINE
   ========================================================================== */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

function initApp() {
  initAmbientVisualizer();
  initAudioEngine();
  initNavigation();
  initBookingForm();
}

/* ==========================================================================
   1. AMBIENT PARTICLES VISUALIZER
   ========================================================================== */
function initAmbientVisualizer() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  const celestialObjects = [];
  const totalCount = Math.min(85, Math.floor((width * height) / 18000));

  const mouse = { x: null, y: null, radius: 180 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  class CelestialObject {
    constructor() {
      this.reset(true);
    }

    reset(init = false) {
      this.x = Math.random() * width;
      this.y = init ? Math.random() * height : height + 30;

      // Standard Star Movement
      this.baseVx = (Math.random() - 0.5) * 0.35;
      this.baseVy = -(Math.random() * 0.45 + 0.15);
      this.vx = this.baseVx;
      this.vy = this.baseVy;

      // Realistic Photorealistic Star Properties
      this.size = Math.random() < 0.8 ? (Math.random() * 1.0 + 0.4) : (Math.random() * 1.5 + 1.2);
      this.isCrossStar = this.size > 1.4 && Math.random() < 0.25; // Brightest stars have delicate 4-point flares
      this.twinklePhase = Math.random() * Math.PI * 2;
      this.twinkleSpeed = Math.random() * 0.035 + 0.012;
      this.baseOpacity = Math.random() * 0.45 + 0.45;

      // All stars are pure white (star-like)
      this.color = '#ffffff';
    }

    update() {
      // Ultra-gentle mouse nudge (no sudden acceleration)
      if (mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.vx += Math.cos(angle) * force * 0.015;
          this.vy += Math.sin(angle) * force * 0.015;
        }
      }

      // Smooth Velocity Damping towards base cruising speed
      this.vx = this.vx * 0.96 + this.baseVx * 0.04;
      this.vy = this.vy * 0.96 + this.baseVy * 0.04;

      // Hard Velocity Speed Limit (Strictly caps maximum speed to prevent fast movements)
      const currentSpeed = Math.hypot(this.vx, this.vy);
      const maxAllowedSpeed = 0.55;
      if (currentSpeed > maxAllowedSpeed) {
        this.vx = (this.vx / currentSpeed) * maxAllowedSpeed;
        this.vy = (this.vy / currentSpeed) * maxAllowedSpeed;
      }

      this.x += this.vx;
      this.y += this.vy;

      // Smooth Screen Edge Wrapping
      if (this.x < -60) this.x = width + 60;
      if (this.x > width + 60) this.x = -60;
      if (this.y < -60) {
        this.y = height + 40;
        this.x = Math.random() * width;
      }
    }

    draw() {
      this.twinklePhase += this.twinkleSpeed;
      const currentOpacity = this.baseOpacity + Math.sin(this.twinklePhase) * 0.25 + Math.cos(this.twinklePhase * 1.7) * 0.08;
      const alpha = Math.max(0.12, Math.min(1, currentOpacity));

      ctx.save();
      ctx.globalAlpha = alpha;

      // Render soft starlight corona halo for larger stars
      if (this.size > 1.2) {
        const starGlow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2.8);
        starGlow.addColorStop(0, this.color);
        starGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = starGlow;
        ctx.fill();
      }

      if (this.isCrossStar) {
        // Draw delicate 4-point optical diffraction spike flare
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 0.6;
        const arm = this.size * 3.8;

        ctx.beginPath();
        ctx.moveTo(this.x - arm, this.y);
        ctx.lineTo(this.x + arm, this.y);
        ctx.moveTo(this.x, this.y - arm);
        ctx.lineTo(this.x, this.y + arm);
        ctx.stroke();

        // Bright star core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.75, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Photorealistic starlight point
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // Populate space objects
  for (let i = 0; i < totalCount; i++) {
    celestialObjects.push(new CelestialObject());
  }

  function animate() {
    // Fully clear the canvas each frame (no trails)
    ctx.clearRect(0, 0, width, height);

    // Render stars and galaxies (without any connecting lines)
    for (let i = 0; i < celestialObjects.length; i++) {
      celestialObjects[i].update();
      celestialObjects[i].draw();
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. PROCEDURAL TECHNO AUDIO ENGINE (WEB AUDIO API)
   ========================================================================== */
function initAudioEngine() {
  // Track metadata
  const tracks = [
    {
      id: 'pump-up-the-bass',
      title: 'Pump Up The Bass',
      album: 'Pump Up The Bass • MW-2',
      style: 'Hard Techno',
      duration: 30, // will automatically update to real audio duration once loaded
      audioSrc: '/Pump_Up_The_Bass/Pump_Up_The_Bass.wav',
      artwork: '/Pump_Up_The_Bass/Pump_Up_The_Bass_Final_Cover.png'
    },
    {
      id: 'No_End_Withoud_Beginning',
      title: 'No End Without Beginning',
      album: 'No End Without Beginning • MW-1',
      style: 'Techno',
      duration: 30, // will automatically update to real audio duration once loaded
      audioSrc: '/No_End_Withoud_Beginning/No_End_Without_Beginning_Master.mp3',
      artwork: '/No_End_Withoud_Beginning/No_End_Without_Beginning_Image.png'
    }
  ];

  let currentTrackIndex = -1;
  let audioContext = null;
  let isPlaying = false;
  let synthLoopId = null;
  let realAudioPlayer = new Audio(); // HTML5 Audio player for real WAV/MP3 files


  // Track Playback Timeline states
  let playbackStartTime = 0;
  let pausedTimeOffset = 0;
  let timelineInterval = null;
  let trackDuration = 30; // 30 sec preview limits

  // Select DOM Elements
  const player = document.getElementById('persistent-player');
  const playBtn = document.getElementById('player-btn-play');
  const prevBtn = document.getElementById('player-btn-prev');
  const nextBtn = document.getElementById('player-btn-next');
  const playerTitle = document.getElementById('player-track-title');
  const playerAlbum = document.getElementById('player-track-album');
  const progressBar = document.getElementById('player-progress');
  const progressContainer = document.getElementById('player-progress-container');
  const timeCurrent = document.getElementById('player-time-current');
  const timeTotal = document.getElementById('player-time-total');
  const muteBtn = document.getElementById('player-btn-mute');
  const volumeSlider = document.getElementById('player-volume-slider');
  const miniVisualizer = document.getElementById('mini-visualizer');
  const playerArt = document.getElementById('player-art');

  // Init Audio Context (must be user action triggered)
  // Init Audio Context (must be user action triggered)
  function initContext() {
    if (audioContext) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }

  function stopPlayback() {
    isPlaying = false;
    if (realAudioPlayer) {
      realAudioPlayer.pause();
    }
  }

  realAudioPlayer.onended = () => {
    nextTrack();
  };

  realAudioPlayer.onloadedmetadata = () => {
    if (realAudioPlayer.duration) {
      trackDuration = realAudioPlayer.duration;
    }
  };

  // ==========================================
  // PLAYBACK CONTROL LOGIC
  // ==========================================
  function playTrack(index) {
    initContext();

    if (isPlaying) {
      stopPlayback();
    }

    // Reset visual playing states in grid
    document.querySelectorAll('.track-row').forEach(row => row.classList.remove('playing'));

    currentTrackIndex = index;
    const track = tracks[currentTrackIndex] || tracks[0];

    // Update player text
    playerTitle.textContent = track.title;
    playerAlbum.textContent = track.album;
    trackDuration = track.duration || 30;

    // Update player artwork
    if (playerArt) {
      if (track.artwork) {
        playerArt.style.backgroundImage = `url('${track.artwork}')`;
        playerArt.style.backgroundSize = 'cover';
        playerArt.style.backgroundPosition = 'center';
        playerArt.innerHTML = ''; // hide the emoji fallback
      } else {
        playerArt.style.backgroundImage = '';
        playerArt.innerHTML = '<span>🌑</span>';
      }
    }

    // Highlight running track in list
    const activeRows = document.querySelectorAll(`[data-track-id="${track.id}"]`);
    activeRows.forEach(row => row.classList.add('playing'));

    // Highlight card button
    document.querySelectorAll('.play-card-btn').forEach(btn => {
      if (btn.getAttribute('data-track-id') === track.id) {
        btn.textContent = '⏸';
        btn.classList.add('active');
      } else {
        btn.textContent = '▶';
        btn.classList.remove('active');
      }
    });

    // Reset timelines
    pausedTimeOffset = 0;
    if (audioContext) {
      playbackStartTime = audioContext.currentTime;
    }

    // Play audio file
    if (track.audioSrc) {
      realAudioPlayer.src = track.audioSrc;
      realAudioPlayer.volume = parseFloat(volumeSlider.value) || 0.8;
      realAudioPlayer.play().catch(err => {
        console.warn('Audio playback error:', err);
      });
    }

    isPlaying = true;
    playBtn.textContent = '⏸';
    miniVisualizer.classList.add('animating');
    player.classList.remove('player-hidden');

    // Set up ticking player UI timer
    startTimelineProgress();
  }

  function togglePlayPause() {
    if (currentTrackIndex === -1) {
      // Pick first track if none selected
      playTrack(0);
      return;
    }

    initContext();

    const track = tracks[currentTrackIndex] || tracks[0];

    if (isPlaying) {
      // Pause
      stopPlayback();
      if (audioContext) {
        pausedTimeOffset += audioContext.currentTime - playbackStartTime;
      }
      playBtn.textContent = '▶';
      miniVisualizer.classList.remove('animating');
      document.querySelectorAll('.play-card-btn').forEach(btn => btn.textContent = '▶');
      stopTimelineProgress();
    } else {
      // Resume
      isPlaying = true;
      if (audioContext) {
        playbackStartTime = audioContext.currentTime;
      }
      if (track.audioSrc) {
        if (!realAudioPlayer.src || !realAudioPlayer.src.includes(track.audioSrc)) {
          realAudioPlayer.src = track.audioSrc;
        }
        realAudioPlayer.volume = parseFloat(volumeSlider.value) || 0.8;
        realAudioPlayer.play().catch(err => console.warn('Audio playback error:', err));
      }
      playBtn.textContent = '⏸';
      miniVisualizer.classList.add('animating');

      // Highlight card button
      document.querySelectorAll('.play-card-btn').forEach(btn => {
        if (btn.getAttribute('data-track-id') === track.id) {
          btn.textContent = '⏸';
          btn.classList.add('active');
        }
      });
      // Highlight row list
      document.querySelectorAll(`[data-track-id="${track.id}"]`).forEach(row => row.classList.add('playing'));

      startTimelineProgress();
    }
  }

  function nextTrack() {
    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= tracks.length) {
      nextIndex = 0;
    }
    playTrack(nextIndex);
  }

  function prevTrack() {
    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) {
      prevIndex = tracks.length - 1;
    }
    playTrack(prevIndex);
  }

  // Progress Bar Timeline Manager
  function startTimelineProgress() {
    stopTimelineProgress();

    timelineInterval = setInterval(() => {
      if (!isPlaying) return;

      let elapsed = 0;
      let duration = trackDuration;

      const track = tracks[currentTrackIndex];
      if (track && track.audioSrc && realAudioPlayer && !isNaN(realAudioPlayer.duration) && realAudioPlayer.duration > 0) {
        elapsed = realAudioPlayer.currentTime;
        duration = realAudioPlayer.duration;
        trackDuration = duration;
      } else if (audioContext) {
        elapsed = (audioContext.currentTime - playbackStartTime) + pausedTimeOffset;
      }

      const progressPercent = Math.min(100, (elapsed / duration) * 100);

      progressBar.style.width = `${progressPercent}%`;

      // Update timer labels
      timeCurrent.textContent = formatTime(elapsed);
      timeTotal.textContent = formatTime(duration);

      // Stop track automatically if end reached
      if (elapsed >= duration && duration > 0) {
        nextTrack();
      }
    }, 250);
  }

  function stopTimelineProgress() {
    if (timelineInterval) {
      clearInterval(timelineInterval);
      timelineInterval = null;
    }
  }

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // Handle progress bar clicks to scrub through track
  progressContainer.addEventListener('click', (e) => {
    if (currentTrackIndex === -1) return;

    const clickX = e.offsetX;
    const width = progressContainer.offsetWidth;
    const clickedPercentage = clickX / width;

    const track = tracks[currentTrackIndex];
    if (track && track.audioSrc && realAudioPlayer && realAudioPlayer.duration) {
      realAudioPlayer.currentTime = clickedPercentage * realAudioPlayer.duration;
    } else if (audioContext) {
      pausedTimeOffset = clickedPercentage * trackDuration;
      playbackStartTime = audioContext.currentTime;
    }

    progressBar.style.width = `${clickedPercentage * 100}%`;

    if (!isPlaying) {
      togglePlayPause();
    }
  });

  // ==========================================
  // EVENT LISTENERS HOOKUPS
  // ==========================================

  // Play buttons from main hero showcase
  const heroListenBtn = document.getElementById('hero-listen-btn');
  if (heroListenBtn) {
    heroListenBtn.addEventListener('click', () => {
      const customSrc = heroListenBtn.getAttribute('data-audio-src');
      if (customSrc) {
        tracks[0].audioSrc = customSrc;
      }
      if (currentTrackIndex === 0 && isPlaying) {
        togglePlayPause();
      } else {
        playTrack(0);
      }
    });
  }

  // Track Rows clicks (inside releases lists)
  document.querySelectorAll('.track-row').forEach(row => {
    row.addEventListener('click', (e) => {
      const trackId = row.getAttribute('data-track-id');
      const customSrc = row.getAttribute('data-audio-src');
      let idx = tracks.findIndex(t => t.id === trackId);
      if (idx === -1) idx = 0; // default to first track if id changed

      if (customSrc) {
        tracks[idx].audioSrc = customSrc;
      }

      if (currentTrackIndex === idx) {
        togglePlayPause();
      } else {
        playTrack(idx);
      }
    });
  });

  // Card big play button clicks
  document.querySelectorAll('.play-card-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const trackId = btn.getAttribute('data-track-id');
      let idx = tracks.findIndex(t => t.id === trackId);
      if (idx === -1) idx = 0;

      if (currentTrackIndex === idx) {
        togglePlayPause();
      } else {
        playTrack(idx);
      }
    });
  });

  // Player standard controls
  playBtn.addEventListener('click', togglePlayPause);
  prevBtn.addEventListener('click', prevTrack);
  nextBtn.addEventListener('click', nextTrack);

  // Volume slider control
  volumeSlider.addEventListener('input', (e) => {
    const vol = parseFloat(e.target.value);
    realAudioPlayer.volume = vol;
    if (vol === 0) {
      muteBtn.textContent = '🔇';
    } else {
      muteBtn.textContent = '🔊';
    }
  });

  // Mute control
  let lastVolume = 0.7;
  muteBtn.addEventListener('click', () => {
    if (parseFloat(volumeSlider.value) > 0) {
      lastVolume = parseFloat(volumeSlider.value);
      volumeSlider.value = 0;
      realAudioPlayer.volume = 0;
      muteBtn.textContent = '🔇';
    } else {
      volumeSlider.value = lastVolume;
      realAudioPlayer.volume = lastVolume;
      muteBtn.textContent = '🔊';
    }
  });
}

/* ==========================================================================
   3. NAVIGATION LOGIC
   ========================================================================== */
function initNavigation() {
  const header = document.getElementById('main-header');
  const nav = document.getElementById('main-nav');
  const toggle = document.getElementById('mobile-menu-toggle');

  // Header scroll class toggle
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Mobile menu display toggle
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      toggle.classList.toggle('active');
    });

    // Close menu when clicking nav link
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('active');
        toggle.classList.remove('active');
      });
    });
  }

  // Active section spy on scroll
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   4. BOOKING FORM HANDLER
   ========================================================================== */
function initBookingForm() {
  const form = document.getElementById('booking-form');
  const status = document.getElementById('form-status');
  if (!form || !status) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = form.querySelector('#form-name')?.value || '';
    const email = form.querySelector('#form-email')?.value || '';
    const typeSelect = form.querySelector('#form-type');
    const typeText = typeSelect?.options[typeSelect.selectedIndex]?.text || 'General Inquiry';
    const message = form.querySelector('#form-message')?.value || '';

    // Prepare mailto payload
    const recipient = 'moonwalker.technoproductions@gmail.com';
    const subject = encodeURIComponent(`[Booking Inquiry - ${typeText}] from ${name}`);
    const body = encodeURIComponent(
      `Name/Agency: ${name}\n` +
      `Contact Email: ${email}\n` +
      `Inquiry Type: ${typeText}\n\n` +
      `Message Details:\n${message}\n`
    );

    status.className = 'form-status-message';
    status.textContent = 'PREPARING SECURE TRANSMISSION...';

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'TRANSMITTING...';

    setTimeout(() => {
      status.className = 'form-status-message success';
      status.textContent = '▲ TRANSMISSION READY — OPENING YOUR EMAIL CLIENT TO SEND TO MOONWALKER.';

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;

      // Trigger mailto client
      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;

      form.reset();

      setTimeout(() => {
        status.textContent = '';
      }, 7000);
    }, 1200);
  });
}
