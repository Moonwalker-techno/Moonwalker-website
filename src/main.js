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
  // Track metadata with exact durations in seconds
  const tracks = [
    {
      id: 'No_End_Withoud_Beginning',
      title: 'No End Without Beginning',
      album: 'No End Without Beginning • MW-1',
      style: 'Techno',
      duration: 382,
      audioSrc: '/No_End_Withoud_Beginning/No_End_Without_Beginning_Master.mp3',
      artwork: '/No_End_Withoud_Beginning/No_End_Without_Beginning_Image.png'
    },
    {
      id: 'pump-up-the-bass',
      title: 'Pump Up The Bass',
      album: 'Pump Up The Bass • MW-2',
      style: 'Hard Techno',
      duration: 413,
      audioSrc: '/Pump_Up_The_Bass/Pump_Up_the_Bass_FInal_Master.mp3',
      artwork: '/Pump_Up_The_Bass/Pump_Up_The_Bass_Final_Cover.png'
    },
    {
      id: 'An_Illusion_of_Freedom',
      title: 'An Illusion of Freedom',
      album: 'An Illusion of Freedom • MW-3',
      style: 'Techno',
      duration: 347,
      audioSrc: '/An_Illusion_of_Freedom/An_Illusion_of_Freedom_MASTER.mp3',
      artwork: '/An_Illusion_of_Freedom/An_Illusion_of_Freedom_cover1.png'
    },
    {
      id: 'Roll_The_Dice',
      title: 'Roll The Dice',
      album: 'Roll The Dice • MW-4',
      style: 'Techno',
      duration: 339,
      audioSrc: '/Roll_the_Dice/Roll_the_Dice_MASTER.mp3',
      artwork: '/Roll_the_Dice/Roll_the_Dice_Cover.png'
    },
    {
      id: 'Rave_All_Night',
      title: 'Rave All Night',
      album: 'Rave All Night EP • MW-5',
      style: 'Hard Trance / Techno',
      duration: 315,
      audioSrc: '/Rave_All_Night/Rave_All_Night.mp3',
      artwork: '/Rave_All_Night/Rave_All_Night_Cover.png'
    },
    {
      id: 'Rave_All_Night_Hard_Techno_Edit',
      title: 'Rave All Night (Hard Techno Edit)',
      album: 'Rave All Night EP • MW-5',
      style: 'Hard Techno',
      duration: 315,
      audioSrc: '/Rave_All_Night/Rave_All_Night_Hard_Techno_Edit.mp3',
      artwork: '/Rave_All_Night/Rave_All_Night_Cover.png'
    }
  ];

  let currentTrackIndex = -1;
  let isPlaying = false;
  const realAudioPlayer = new Audio();
  realAudioPlayer.preload = 'auto';

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

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function updateTimelineUI() {
    const elapsed = realAudioPlayer.currentTime || 0;
    const track = tracks[currentTrackIndex];
    const duration = (!isNaN(realAudioPlayer.duration) && realAudioPlayer.duration > 0)
      ? realAudioPlayer.duration
      : (track?.duration || 315);

    const progressPercent = Math.min(100, (elapsed / duration) * 100);
    progressBar.style.width = `${progressPercent}%`;
    timeCurrent.textContent = formatTime(elapsed);
    timeTotal.textContent = formatTime(duration);
  }

  function updateCardAndHeroButtons(trackId, isNowPlaying) {
    // Highlight running track in list
    document.querySelectorAll('.track-row').forEach(row => {
      if (row.getAttribute('data-track-id') === trackId) {
        if (isNowPlaying) row.classList.add('playing');
        else row.classList.remove('playing');
      } else {
        row.classList.remove('playing');
      }
    });

    // Highlight card button
    document.querySelectorAll('.play-card-btn').forEach(btn => {
      const btnTrackId = btn.getAttribute('data-track-id');
      const epTracksAttr = btn.getAttribute('data-ep-tracks');
      const epTracks = epTracksAttr ? epTracksAttr.split(',') : [btnTrackId];
      if (epTracks.includes(trackId)) {
        btn.textContent = isNowPlaying ? '⏸' : '▶';
        if (isNowPlaying) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      } else {
        btn.textContent = '▶';
        btn.classList.remove('active');
      }
    });

    // Update hero showcase listen button
    const heroBtn = document.getElementById('hero-listen-btn');
    if (heroBtn) {
      const heroRelease = heroBtn.getAttribute('data-release');
      if (heroRelease === trackId) {
        heroBtn.innerHTML = isNowPlaying ? '<span class="btn-icon">⏸</span> PAUSE' : '<span class="btn-icon">▶</span> LISTEN NOW';
      } else {
        heroBtn.innerHTML = '<span class="btn-icon">▶</span> LISTEN NOW';
      }
    }
  }

  // Audio Player Event Listeners
  realAudioPlayer.addEventListener('timeupdate', updateTimelineUI);

  realAudioPlayer.addEventListener('loadedmetadata', () => {
    if (realAudioPlayer.duration && !isNaN(realAudioPlayer.duration)) {
      timeTotal.textContent = formatTime(realAudioPlayer.duration);
    }
  });

  realAudioPlayer.addEventListener('playing', () => {
    isPlaying = true;
    playBtn.textContent = '⏸';
    miniVisualizer.classList.add('animating');
    player.classList.remove('player-hidden');
    if (tracks[currentTrackIndex]) {
      updateCardAndHeroButtons(tracks[currentTrackIndex].id, true);
    }
  });

  realAudioPlayer.addEventListener('pause', () => {
    if (realAudioPlayer.currentTime < realAudioPlayer.duration) {
      isPlaying = false;
      playBtn.textContent = '▶';
      miniVisualizer.classList.remove('animating');
      if (tracks[currentTrackIndex]) {
        updateCardAndHeroButtons(tracks[currentTrackIndex].id, false);
      }
    }
  });

  realAudioPlayer.addEventListener('ended', () => {
    nextTrack();
  });

  // PLAYBACK CONTROL LOGIC
  function playTrack(index) {
    if (index < 0 || index >= tracks.length) index = 0;
    currentTrackIndex = index;
    const track = tracks[currentTrackIndex];

    // Update player text
    playerTitle.textContent = track.title;
    playerAlbum.textContent = track.album;
    timeTotal.textContent = formatTime(track.duration);

    // Update player artwork
    if (playerArt) {
      if (track.artwork) {
        playerArt.style.backgroundImage = `url('${track.artwork}')`;
        playerArt.style.backgroundSize = 'cover';
        playerArt.style.backgroundPosition = 'center';
        playerArt.innerHTML = '';
      } else {
        playerArt.style.backgroundImage = '';
        playerArt.innerHTML = '<span>🌑</span>';
      }
    }

    // Ensure player is visible
    player.classList.remove('player-hidden');

    // Only update audio source if it differs to preserve cached buffer
    if (!realAudioPlayer.src || !realAudioPlayer.src.includes(encodeURI(track.audioSrc))) {
      realAudioPlayer.src = track.audioSrc;
    }

    realAudioPlayer.volume = parseFloat(volumeSlider.value) || 0.8;
    updateTimelineUI();

    const playPromise = realAudioPlayer.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        isPlaying = true;
        playBtn.textContent = '⏸';
        miniVisualizer.classList.add('animating');
        updateCardAndHeroButtons(track.id, true);
      }).catch(err => {
        // Autoplay policy prevented playback, keep primed
        console.warn('Autoplay waiting for user gesture:', err);
        isPlaying = false;
        playBtn.textContent = '▶';
        miniVisualizer.classList.remove('animating');
        updateCardAndHeroButtons(track.id, false);
      });
    }
  }

  function togglePlayPause() {
    if (currentTrackIndex === -1) {
      const latestIdx = tracks.findIndex(t => t.id === 'Rave_All_Night');
      playTrack(latestIdx !== -1 ? latestIdx : 0);
      return;
    }

    const track = tracks[currentTrackIndex] || tracks[0];

    if (isPlaying && !realAudioPlayer.paused) {
      realAudioPlayer.pause();
    } else {
      if (!realAudioPlayer.src || !realAudioPlayer.src.includes(encodeURI(track.audioSrc))) {
        realAudioPlayer.src = track.audioSrc;
      }
      realAudioPlayer.volume = parseFloat(volumeSlider.value) || 0.8;
      realAudioPlayer.play().then(() => {
        isPlaying = true;
        playBtn.textContent = '⏸';
        miniVisualizer.classList.add('animating');
        updateCardAndHeroButtons(track.id, true);
      }).catch(err => console.warn('Audio playback error:', err));
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

  // Handle progress bar clicks to scrub through track
  progressContainer.addEventListener('click', (e) => {
    if (currentTrackIndex === -1) return;

    const clickX = e.offsetX;
    const width = progressContainer.offsetWidth;
    const clickedPercentage = clickX / width;

    const track = tracks[currentTrackIndex];
    const duration = (!isNaN(realAudioPlayer.duration) && realAudioPlayer.duration > 0)
      ? realAudioPlayer.duration
      : (track?.duration || 315);

    realAudioPlayer.currentTime = clickedPercentage * duration;
    updateTimelineUI();

    if (realAudioPlayer.paused) {
      realAudioPlayer.play().catch(() => { });
    }
  });

  // Play buttons from main hero showcase
  const heroListenBtn = document.getElementById('hero-listen-btn');
  if (heroListenBtn) {
    heroListenBtn.addEventListener('click', () => {
      const releaseId = heroListenBtn.getAttribute('data-release');
      let idx = tracks.findIndex(t => t.id === releaseId);
      if (idx === -1) idx = tracks.findIndex(t => t.id === 'Rave_All_Night');
      if (idx === -1) idx = 0;

      if (currentTrackIndex === idx) {
        togglePlayPause();
      } else {
        playTrack(idx);
      }
    });
  }

  // Track Rows clicks (inside releases lists)
  document.querySelectorAll('.track-row').forEach(row => {
    row.addEventListener('click', () => {
      const trackId = row.getAttribute('data-track-id');
      let idx = tracks.findIndex(t => t.id === trackId);
      if (idx === -1) idx = 0;

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
      const epTracksAttr = btn.getAttribute('data-ep-tracks');
      const epTracks = epTracksAttr ? epTracksAttr.split(',') : [trackId];

      const currentTrack = tracks[currentTrackIndex];
      if (currentTrack && epTracks.includes(currentTrack.id)) {
        togglePlayPause();
      } else {
        let idx = tracks.findIndex(t => t.id === trackId);
        if (idx === -1) idx = 0;
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

  // Default to Latest Release (Rave All Night) and trigger immediate playback on entry
  const defaultIdx = tracks.findIndex(t => t.id === 'Rave_All_Night');
  const initialIndex = defaultIdx !== -1 ? defaultIdx : 0;

  // Preload and start playback immediately
  playTrack(initialIndex);

  // Seamless fallback if browser autoplay policy delays playback until first user gesture
  const startOnFirstGesture = () => {
    if (realAudioPlayer.paused) {
      realAudioPlayer.play().catch(() => { });
    }
    ['click', 'touchstart', 'keydown', 'scroll'].forEach(evt => {
      window.removeEventListener(evt, startOnFirstGesture);
    });
  };

  ['click', 'touchstart', 'keydown', 'scroll'].forEach(evt => {
    window.addEventListener(evt, startOnFirstGesture, { once: true, passive: true });
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
