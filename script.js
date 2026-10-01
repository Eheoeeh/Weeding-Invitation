/**
 * LUXURY BOTANICAL WEDDING INVITATION - LOGIC & INTERACTIONS
 * Features: 3D Envelope Opening, Wax Seal Break, Parallax Tilt,
 * Web Audio Romantic Harp Synth, Falling Petals, Calendar (.ics),
 * RSVP Management, WhatsApp Share, & High-Res Image Export.
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- Elements ---
  const cardContainer = document.getElementById('card-container');
  const weddingCard = document.getElementById('wedding-card');
  const cardSheen = document.getElementById('card-sheen');
  const actionDock = document.getElementById('action-dock');
  const guestPill = document.getElementById('guest-pill');
  const guestNameDisplay = document.getElementById('guest-name-display');
  const cardGuestTag = document.getElementById('card-guest-tag');
  const cardGuestName = document.getElementById('card-guest-name');
  const musicBtn = document.getElementById('music-btn');
  const musicIcon = document.getElementById('music-icon');
  const dockMusicBtn = document.getElementById('dock-music');
  const dockMusicIcon = document.getElementById('dock-music-icon');
  const themeBtn = document.getElementById('theme-btn');
  const editBtn = document.getElementById('edit-btn');
  const replayBtn = document.getElementById('replay-btn');
  const sealInitials = document.getElementById('seal-initials');

  // Entrance Experiences Elements
  const btnModeRibbon = document.getElementById('btn-mode-ribbon');
  const btnModeBlossom = document.getElementById('btn-mode-blossom');
  const ribbonOverlay = document.getElementById('ribbon-overlay');
  const ribbonSeal = document.getElementById('ribbon-seal');
  const blossomOverlay = document.getElementById('blossom-overlay');
  const blossomBouquet = document.getElementById('blossom-bouquet');

  // Pre-decode high-res watercolor card texture so GPU has zero decode lag on reveal
  const cardBgPreload = new Image();
  cardBgPreload.src = 'theme_watercolor_deckled.jpg';
  if (cardBgPreload.decode) {
    cardBgPreload.decode().catch(() => {});
  }

  // Text Elements on Card
  const txtHost = document.getElementById('txt-host');
  const txtIntro = document.getElementById('txt-intro');
  const txtGroomName = document.getElementById('txt-groom-name');
  const txtLetter = document.getElementById('txt-letter');
  const txtMehndiDate = document.getElementById('txt-mehndi-date');
  const txtMehndiTime = document.getElementById('txt-mehndi-time');
  const txtBaratDate = document.getElementById('txt-barat-date');
  const txtBaratTime = document.getElementById('txt-barat-time');
  const txtWalimaDate = document.getElementById('txt-walima-date');
  const txtWalimaTime = document.getElementById('txt-walima-time');
  const txtVenueName = document.getElementById('txt-venue-name');
  const txtVenueAddr = document.getElementById('txt-venue-addr');
  const txtBanquet = document.getElementById('txt-banquet');

  // Default Wedding Data (Bilal Ahmed Celebrations)
  const defaultData = {
    groomName: 'Bilal Ahmed',
    hostLine: 'Hosted by Mr. & Mrs. Irshad Ahmed',
    letterQuote: '“With hearts full of joy and gratitude to Almighty Allah, we cordially invite you and your family to grace these auspicious celebrations with your gracious presence, warm prayers, and love.”',
    dateMehndi: 'THURSDAY, 29TH OCTOBER 2026',
    timeMehndi: 'Mehndi Ceremony • at 7:00 PM',
    dateBarat: 'FRIDAY, 30TH OCTOBER 2026',
    timeBarat: 'Barat Ceremony • at 5:00 PM',
    dateWalima: 'SATURDAY, 31ST OCTOBER 2026',
    timeWalima: 'Walima Ceremony • at 6:00 PM',
    venueName: 'PARIS MARRIAGE HALL',
    venueAddress: 'Opposite Second Cup, G.T. Road, Eminabad Morr, Gujranwala',
    banquetLine: '✦ Dinner will follow ✦',
    targetDate: '2026-10-29T19:00:00'
  };

  // State
  let weddingData = { ...defaultData };
  let activeRevealMode = 'blossom'; // 'blossom' (Default Experience) or 'ribbon'
  let isRevealed = false;
  let isPlayingMusic = false;
  let currentTheme = 'deckled'; // 'deckled' (default) or 'gouache'

  // --- Load Persisted Customizations or URL Params ---
  function initData() {
    const saved = localStorage.getItem('wedding_card_data_v2');
    if (saved) {
      try {
        weddingData = { ...weddingData, ...JSON.parse(saved) };
      } catch (e) {
        console.error(e);
      }
    }

    // Check URL parameters
    const params = new URLSearchParams(window.location.search);
    const guestParam = params.get('guest');
    if (guestParam) {
      if (guestNameDisplay) guestNameDisplay.textContent = guestParam;
      if (cardGuestName) cardGuestName.textContent = guestParam;
      if (cardGuestTag) cardGuestTag.style.display = 'block';
    }

    if (params.get('theme') === 'gouache') {
      currentTheme = 'gouache';
      weddingCard.classList.add('theme-gouache');
    }

    // Check reveal mode parameter (?reveal=ribbon or default to blossom)
    const revealParam = params.get('reveal');
    if (revealParam === 'ribbon') {
      setRevealMode('ribbon', false);
    } else {
      setRevealMode('blossom', false);
    }

    renderCardText();

    if (params.get('open') === 'true') {
      triggerActiveReveal(false);
    }
  }

  function renderCardText() {
    if (txtHost) txtHost.textContent = weddingData.hostLine;
    if (txtGroomName) txtGroomName.textContent = weddingData.groomName;
    if (txtLetter) txtLetter.textContent = weddingData.letterQuote;
    if (txtMehndiDate) txtMehndiDate.textContent = weddingData.dateMehndi;
    if (txtMehndiTime) txtMehndiTime.textContent = weddingData.timeMehndi;
    if (txtBaratDate) txtBaratDate.textContent = weddingData.dateBarat;
    if (txtBaratTime) txtBaratTime.textContent = weddingData.timeBarat;
    if (txtWalimaDate) txtWalimaDate.textContent = weddingData.dateWalima;
    if (txtWalimaTime) txtWalimaTime.textContent = weddingData.timeWalima;
    if (txtVenueName) txtVenueName.textContent = weddingData.venueName;
    if (txtVenueAddr) txtVenueAddr.textContent = weddingData.venueAddress;
    if (txtBanquet) txtBanquet.textContent = weddingData.banquetLine;

    // Update monogram initials on wax seal
    if (sealInitials) sealInitials.textContent = 'BA';

    // Update groom name in blossom veil caption
    const blossomHeroName = document.getElementById('blossom-hero-name') || document.querySelector('.blossom-couple');
    if (blossomHeroName) {
      blossomHeroName.textContent = weddingData.groomName;
    }

    // Update modal venue texts
    const modalVenueName = document.getElementById('modal-venue-name');
    if (modalVenueName) modalVenueName.textContent = weddingData.venueName;
    const modalVenueAddr = document.getElementById('modal-venue-addr');
    if (modalVenueAddr) modalVenueAddr.innerHTML = `${weddingData.venueAddress.replace(',', ',<br>')}`;
  }

  // --- Audio Synthesis Engine (Romantic Harp & Piano Melodies) ---
  let audioCtx = null;
  let synthInterval = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Play a realistic harp/chime note
  function playHarpNote(freq, time, duration = 2.4, gainLevel = 0.12) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, time);
    filter.frequency.exponentialRampToValueAtTime(300, time + duration);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(gainLevel, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  // Play seal crack / paper rustle sound
  function playSealSound() {
    initAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    
    // Quick resonant chime
    playHarpNote(523.25, now, 1.2, 0.1); // C5
    playHarpNote(659.25, now + 0.08, 1.4, 0.1); // E5
    playHarpNote(783.99, now + 0.16, 1.8, 0.14); // G5
    playHarpNote(1046.50, now + 0.24, 2.5, 0.15); // C6
  }

  // Romantic cascading harp glissando when blossom blooms
  function playBloomSound() {
    initAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const bloomChord = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51, 1567.98];
    bloomChord.forEach((freq, idx) => {
      playHarpNote(freq, now + idx * 0.07, 2.6, 0.11);
    });
  }

  // Romantic Canon arpeggios
  const melodyNotes = [
    // D major chord
    587.33, 739.99, 880.00, 1174.66,
    // A major chord
    440.00, 554.37, 659.25, 880.00,
    // B minor chord
    493.88, 587.33, 739.99, 987.77,
    // F# minor chord
    369.99, 440.00, 554.37, 739.99,
    // G major chord
    392.00, 493.88, 587.33, 783.99,
    // D major chord
    293.66, 369.99, 440.00, 587.33,
    // G major
    392.00, 493.88, 587.33, 783.99,
    // A major
    440.00, 554.37, 659.25, 880.00
  ];

  function toggleMusic() {
    initAudio();
    if (isPlayingMusic) {
      clearInterval(synthInterval);
      isPlayingMusic = false;
      if (musicBtn) {
        musicBtn.classList.remove('playing');
        if (musicIcon) musicIcon.textContent = '🎵';
      }
      if (dockMusicBtn) {
        dockMusicBtn.classList.remove('active');
        if (dockMusicIcon) dockMusicIcon.textContent = '🎵';
      }
    } else {
      isPlayingMusic = true;
      if (musicBtn) {
        musicBtn.classList.add('playing');
        if (musicIcon) musicIcon.textContent = '🔊';
      }
      if (dockMusicBtn) {
        dockMusicBtn.classList.add('active');
        if (dockMusicIcon) dockMusicIcon.textContent = '🔊';
      }

      let step = 0;
      const playStep = () => {
        if (!isPlayingMusic || !audioCtx) return;
        const note = melodyNotes[step % melodyNotes.length];
        const now = audioCtx.currentTime;
        playHarpNote(note, now, 2.5, 0.09);

        // Add soft harmonic bass every 4 steps
        if (step % 4 === 0) {
          playHarpNote(note / 2, now, 3.2, 0.08);
        }
        step++;
      };

      playStep();
      synthInterval = setInterval(playStep, 550);
    }
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', toggleMusic);
  }
  if (dockMusicBtn) {
    dockMusicBtn.addEventListener('click', toggleMusic);
  }

  // --- Reveal Mode Switcher ---
  function setRevealMode(mode, triggerCelebration = false) {
    activeRevealMode = mode;
    isRevealed = false;

    // Kill any active GSAP tweens on reveal elements
    if (typeof gsap !== 'undefined') {
      gsap.killTweensOf([cardContainer, blossomBouquet, blossomOverlay, actionDock]);
      if (blossomOverlay) {
        const blossomText = blossomOverlay.querySelectorAll('.blossom-caption, .blossom-prompt');
        if (blossomText.length) gsap.killTweensOf(blossomText);
      }
    }

    actionDock.classList.remove('visible');
    if (actionDock) {
      actionDock.style.opacity = '';
      actionDock.style.transform = '';
    }

    // Clean up any remaining floating leaf particles
    if (leafRafId) {
      cancelAnimationFrame(leafRafId);
      leafRafId = null;
    }
    activeLeaves.length = 0;
    document.querySelectorAll('.botanical-leaf-particle').forEach(el => el.remove());

    if (btnModeRibbon) btnModeRibbon.classList.toggle('active', mode === 'ribbon');
    if (btnModeBlossom) btnModeBlossom.classList.toggle('active', mode === 'blossom');

    if (mode === 'ribbon') {
      if (blossomOverlay) {
        blossomOverlay.classList.add('hidden');
        blossomOverlay.classList.remove('blooming');
      }
      if (cardContainer) {
        cardContainer.classList.remove('card-hidden');
        cardContainer.classList.add('card-revealed');
        cardContainer.style.opacity = '1';
        cardContainer.style.visibility = 'visible';
        cardContainer.style.transform = '';
        cardContainer.style.filter = '';
      }
      if (ribbonOverlay) {
        ribbonOverlay.classList.remove('hidden', 'untying');
      }
      const scrollHint = document.getElementById('scroll-hint');
      const weddingDetailsFlow = document.getElementById('wedding-details-flow');
      if (scrollHint) {
        scrollHint.style.display = 'flex';
        scrollHint.style.opacity = '1';
      }
      if (weddingDetailsFlow) {
        weddingDetailsFlow.style.display = 'flex';
        weddingDetailsFlow.style.opacity = '1';
      }
      const pageBackdrop = document.getElementById('page-backdrop');
      if (pageBackdrop) {
        pageBackdrop.classList.add('visible');
        pageBackdrop.style.opacity = '1';
      }
      document.body.classList.add('revealed');
    } else {
      // Blossom mode: NO CARD or deckled background shown initially on landing screen
      if (cardContainer) {
        cardContainer.classList.remove('card-revealed');
        cardContainer.classList.add('card-hidden');
        cardContainer.style.opacity = '0';
        cardContainer.style.visibility = 'hidden';
        cardContainer.style.transform = '';
        cardContainer.style.filter = '';
      }
      if (ribbonOverlay) {
        ribbonOverlay.classList.add('hidden');
        ribbonOverlay.classList.remove('untying');
      }
      if (blossomOverlay) {
        blossomOverlay.classList.remove('hidden', 'blooming');
        blossomOverlay.style.opacity = '1';
        blossomOverlay.style.visibility = 'visible';
        const blossomText = blossomOverlay.querySelectorAll('.blossom-caption, .blossom-prompt');
        blossomText.forEach(el => {
          el.style.opacity = '1';
          el.style.transform = '';
        });
      }
      if (blossomBouquet) {
        blossomBouquet.style.opacity = '1';
        blossomBouquet.style.transform = '';
        blossomBouquet.style.filter = '';
      }
      const scrollHint = document.getElementById('scroll-hint');
      const weddingDetailsFlow = document.getElementById('wedding-details-flow');
      if (scrollHint) {
        scrollHint.style.display = 'none';
        scrollHint.style.opacity = '0';
      }
      if (weddingDetailsFlow) {
        weddingDetailsFlow.style.display = 'none';
        weddingDetailsFlow.style.opacity = '0';
      }
      // Keep page backdrop hidden on landing page
      const pageBackdrop = document.getElementById('page-backdrop');
      if (pageBackdrop) {
        pageBackdrop.classList.remove('visible');
        pageBackdrop.style.opacity = '0';
      }
      document.body.classList.remove('revealed');
    }

    if (triggerCelebration) {
      if (mode === 'blossom') {
        triggerBotanicalLeavesPop(window.innerWidth / 2, 70, 14);
      } else {
        triggerConfetti(window.innerWidth / 2, 70, ['#dfc3d6', '#baa5b7', '#ffffff']);
      }
    }
  }

  function triggerActiveReveal(withAudio = true) {
    if (activeRevealMode === 'ribbon') {
      untieRibbon(withAudio);
    } else {
      bloomBlossom(withAudio);
    }
  }

  // --- Experience 1: Untie Silk Ribbon & Gold Wax Seal ---
  function untieRibbon(withAudio = true) {
    if (isRevealed) return;
    isRevealed = true;

    if (cardContainer) {
      cardContainer.classList.remove('card-hidden');
      cardContainer.classList.add('card-revealed');
    }

    if (withAudio) {
      playSealSound();
    }

    // Sparkle burst around the 3D gold wax seal
    if (ribbonSeal) {
      createGoldBurst(ribbonSeal);
    }

    // Ribbon bands flutter and slide away horizontally
    if (ribbonOverlay) {
      ribbonOverlay.classList.add('untying');
    }

    // Reveal action dock with silky GSAP glide
    if (typeof gsap !== 'undefined' && actionDock) {
      gsap.fromTo(actionDock,
        { opacity: 0, y: 26 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          delay: 0.55,
          ease: 'power2.out',
          onStart: () => {
            actionDock.classList.add('visible');
          }
        }
      );
      setTimeout(() => {
        triggerConfetti(window.innerWidth / 2, window.innerHeight * 0.45);
        if (!isPlayingMusic && withAudio) {
          setTimeout(toggleMusic, 350);
        }
      }, 550);
    } else {
      setTimeout(() => {
        actionDock.classList.add('visible');
        triggerConfetti(window.innerWidth / 2, window.innerHeight * 0.45);
        if (!isPlayingMusic && withAudio) {
          setTimeout(toggleMusic, 350);
        }
      }, 550);
    }

    // Reveal scroll hint, backdrop, and extended wedding sections
    const scrollHint = document.getElementById('scroll-hint');
    const weddingDetailsFlow = document.getElementById('wedding-details-flow');
    const pageBackdrop = document.getElementById('page-backdrop');
    if (pageBackdrop) {
      pageBackdrop.classList.add('visible');
      if (typeof gsap !== 'undefined') {
        gsap.to(pageBackdrop, { opacity: 1, duration: 1.25, ease: 'power2.out' });
      } else {
        pageBackdrop.style.opacity = '1';
      }
    }
    document.body.classList.add('revealed');

    if (scrollHint) {
      scrollHint.style.display = 'flex';
      scrollHint.style.opacity = '1';
    }
    if (weddingDetailsFlow) {
      weddingDetailsFlow.style.display = 'flex';
      weddingDetailsFlow.style.opacity = '1';
    }

    // Hide overlay completely once untying animation finishes
    setTimeout(() => {
      if (ribbonOverlay) ribbonOverlay.classList.add('hidden');
    }, 1050);
  }

  // --- Experience 2: Blossom to Bloom ---
  function bloomBlossom(withAudio = true) {
    if (isRevealed) return;
    isRevealed = true;

    if (withAudio) {
      playBloomSound();
    }

    // Burst magnificent rain of light blue & purple botanical leaves across the entire screen!
    const anchorEl = blossomBouquet || blossomOverlay;
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      triggerBotanicalLeafRain(cx, cy);
      spawnBloomPetals(cx, cy, 30);
    }

    if (typeof gsap !== 'undefined') {
      // 1. Blossom flower expands outward and dissolves into radiant floral mist
      if (blossomBouquet) {
        gsap.to(blossomBouquet, {
          scale: 1.5,
          rotation: 14,
          opacity: 0,
          filter: 'blur(12px)',
          duration: 0.85,
          ease: 'power2.out'
        });
      }

      // 2. Caption and prompt glide gently up and fade away
      const blossomText = blossomOverlay ? blossomOverlay.querySelectorAll('.blossom-caption, .blossom-prompt') : [];
      if (blossomText.length) {
        gsap.to(blossomText, {
          opacity: 0,
          y: -16,
          duration: 0.55,
          ease: 'power2.out'
        });
      }

      // 3. Blossom overlay fades out and hides
      if (blossomOverlay) {
        blossomOverlay.classList.add('blooming');
        gsap.to(blossomOverlay, {
          opacity: 0,
          duration: 0.85,
          ease: 'power2.out',
          onComplete: () => {
            blossomOverlay.classList.add('hidden');
          }
        });
      }

      // 4. REVEAL THE FULL-PAGE WATERCOLOR BACKDROP & WEDDING CARD!
      const pageBackdrop = document.getElementById('page-backdrop');
      if (pageBackdrop) {
        pageBackdrop.classList.add('visible');
        gsap.to(pageBackdrop, {
          opacity: 1,
          duration: 1.35,
          delay: 0.05,
          ease: 'power2.out'
        });
      }
      document.body.classList.add('revealed');

      if (cardContainer) {
        cardContainer.classList.remove('card-hidden');
        cardContainer.classList.add('card-revealed');

        gsap.fromTo(cardContainer,
          {
            opacity: 0,
            scale: 0.84,
            rotationX: 8,
            rotationY: -2,
            y: 0,
            filter: 'blur(10px)',
            visibility: 'visible',
            transformOrigin: '50% 50%'
          },
          {
            opacity: 1,
            scale: 1,
            rotationX: 0,
            rotationY: 0,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.25,
            delay: 0.08,
            ease: 'power3.out',
            clearProps: 'transform,filter', // Clear transforms when done so mouse parallax and 3D sheen operate cleanly
            onComplete: () => {
              cardContainer.style.opacity = '1';
              cardContainer.style.visibility = 'visible';
            }
          }
        );
      }

      // 5. Reveal action dock gliding smoothly in from bottom
      if (actionDock) {
        gsap.fromTo(actionDock,
          { opacity: 0, y: 26 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            delay: 0.75,
            ease: 'power2.out',
            onStart: () => {
              actionDock.classList.add('visible');
            }
          }
        );
      }

      // 6. Reveal scroll hint and extended wedding sections
      const scrollHint = document.getElementById('scroll-hint');
      const weddingDetailsFlow = document.getElementById('wedding-details-flow');
      if (scrollHint) {
        scrollHint.style.display = 'flex';
        gsap.fromTo(scrollHint,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.85, delay: 0.95, ease: 'power2.out' }
        );
      }
      if (weddingDetailsFlow) {
        weddingDetailsFlow.style.display = 'flex';
        gsap.fromTo(weddingDetailsFlow,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.0, delay: 1.05, ease: 'power2.out' }
        );
      }

      // Auto-start gentle romantic harp melody
      if (!isPlayingMusic && withAudio) {
        setTimeout(toggleMusic, 450);
      }
    } else {
      // Fallback if GSAP is not available
      const pageBackdrop = document.getElementById('page-backdrop');
      if (pageBackdrop) {
        pageBackdrop.classList.add('visible');
        pageBackdrop.style.opacity = '1';
      }
      document.body.classList.add('revealed');

      if (blossomOverlay) {
        blossomOverlay.classList.add('blooming');
      }
      if (cardContainer) {
        cardContainer.classList.remove('card-hidden');
        cardContainer.classList.add('card-revealed');
      }
      const scrollHint = document.getElementById('scroll-hint');
      const weddingDetailsFlow = document.getElementById('wedding-details-flow');
      if (scrollHint) {
        scrollHint.style.display = 'flex';
        scrollHint.style.opacity = '1';
      }
      if (weddingDetailsFlow) {
        weddingDetailsFlow.style.display = 'flex';
        weddingDetailsFlow.style.opacity = '1';
      }
      setTimeout(() => {
        actionDock.classList.add('visible');
        if (!isPlayingMusic && withAudio) {
          setTimeout(toggleMusic, 350);
        }
      }, 550);
      setTimeout(() => {
        if (blossomOverlay) blossomOverlay.classList.add('hidden');
      }, 900);
    }
  }

  // Replay Opening Animation
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      setRevealMode(activeRevealMode, true);
    });
  }

  // Switcher pill buttons
  if (btnModeRibbon) {
    btnModeRibbon.addEventListener('click', () => {
      if (activeRevealMode !== 'ribbon') {
        setRevealMode('ribbon', true);
      }
    });
  }

  if (btnModeBlossom) {
    btnModeBlossom.addEventListener('click', () => {
      if (activeRevealMode !== 'blossom') {
        setRevealMode('blossom', true);
      }
    });
  }

  // Ribbon Click Handlers
  if (ribbonSeal) {
    ribbonSeal.addEventListener('click', (e) => {
      e.stopPropagation();
      untieRibbon(true);
    });
  }

  if (ribbonOverlay) {
    ribbonOverlay.addEventListener('click', () => {
      untieRibbon(true);
    });
  }

  // Blossom Click Handler - Clicking or tapping anywhere on the screen triggers bloom
  if (blossomOverlay) {
    blossomOverlay.addEventListener('click', (e) => {
      if (e.target.closest('.top-nav') || e.target.closest('.modal-backdrop') || e.target.closest('.modal-window')) {
        return;
      }
      bloomBlossom(true);
    });
  }

  // Document-level listener: clicking anywhere on the entire screen triggers blossom pop
  document.addEventListener('click', (e) => {
    if (activeRevealMode === 'blossom' && !isRevealed && blossomOverlay && !blossomOverlay.classList.contains('hidden') && !blossomOverlay.classList.contains('blooming')) {
      if (e.target.closest('.top-nav') || e.target.closest('.modal-backdrop') || e.target.closest('.modal-window')) {
        return;
      }
      bloomBlossom(true);
    }
  });

  // --- 3D Parallax & Paper Shimmer ---
  let isHovered = false;

  weddingCard.addEventListener('mouseenter', () => {
    isHovered = true;
  });

  weddingCard.addEventListener('mousemove', (e) => {
    if (!isHovered) return;
    const rect = weddingCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -11;
    const rotateY = ((x - centerX) / centerX) * 11;

    weddingCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.025, 1.025, 1.025)`;

    // Move sheen gradient
    const sheenX = (x / rect.width) * 100;
    const sheenY = (y / rect.height) * 100;
    cardSheen.style.background = `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 65%)`;
    cardSheen.style.opacity = '0.65';
  });

  weddingCard.addEventListener('mouseleave', () => {
    isHovered = false;
    weddingCard.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    cardSheen.style.opacity = '0.35';
    cardSheen.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 60%)';
  });

  // --- Theme Switcher (if present) ---
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      if (currentTheme === 'deckled') {
        currentTheme = 'gouache';
        weddingCard.classList.add('theme-gouache');
        themeBtn.title = 'Switch to Fine Watercolor Deckled Card';
        triggerConfetti(window.innerWidth / 2, 80, ['#baa5b7', '#faf8f5']);
      } else {
        currentTheme = 'deckled';
        weddingCard.classList.remove('theme-gouache');
        themeBtn.title = 'Switch to Original Gouache Card';
        triggerConfetti(window.innerWidth / 2, 80, ['#dfc3d6', '#ffffff']);
      }
    });
  }

  // --- Atmospheric Flying Watercolor Blossom Petals Engine ---
  const canvas = document.getElementById('petals-canvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Interactive mouse/touch wind wake
  const mouse = { x: -1000, y: -1000, vx: 0, vy: 0, prevX: 0, prevY: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.vx = (e.clientX - mouse.prevX) * 0.22;
    mouse.vy = (e.clientY - mouse.prevY) * 0.22;
    mouse.prevX = e.clientX;
    mouse.prevY = e.clientY;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const t = e.touches[0];
      mouse.vx = (t.clientX - mouse.prevX) * 0.28;
      mouse.vy = (t.clientY - mouse.prevY) * 0.28;
      mouse.prevX = t.clientX;
      mouse.prevY = t.clientY;
      mouse.x = t.clientX;
      mouse.y = t.clientY;
    }
  }, { passive: true });

  const petalPalettes = [
    { base: '#c6b0cc', mid: '#dfcce5', tip: '#ffffff', shadow: 'rgba(95, 65, 105, 0.10)' }, // Light lilac
    { base: '#a9bbd8', mid: '#cfdbec', tip: '#f2f6fc', shadow: 'rgba(70, 85, 120, 0.10)' }, // Light hydrangea blue
    { base: '#b4cfcc', mid: '#d3e6e4', tip: '#f0f7f6', shadow: 'rgba(80, 110, 105, 0.10)' }, // Soft sage-blue
    { base: '#cbbdd8', mid: '#e3d7ec', tip: '#faf7fc', shadow: 'rgba(90, 75, 100, 0.10)' },  // Soft mauve
    { base: '#d4c0dc', mid: '#ebdcf2', tip: '#ffffff', shadow: 'rgba(110, 85, 115, 0.10)' }  // Pale lavender
  ];

  class FlyingPetal {
    constructor(initial = false) {
      this.reset(initial);
    }

    reset(initial = false) {
      // 3D Depth layer: 0.25 (far back) to 1.0 (near foreground)
      this.depth = Math.random() * 0.75 + 0.25;
      
      // Position: spread evenly across screen on load, or enter from top/left on loop
      if (initial) {
        this.x = Math.random() * (canvas.width + 200) - 100;
        this.y = Math.random() * (canvas.height + 200) - 100;
      } else {
        // Natural wind comes from top-left: 65% enter from top, 35% from left
        if (Math.random() < 0.65) {
          this.x = Math.random() * (canvas.width + 120) - 60;
          this.y = -35;
        } else {
          this.x = -35;
          this.y = Math.random() * (canvas.height * 0.75);
        }
      }

      // Size scaled with 3D depth
      this.baseSize = (Math.random() * 11 + 9) * this.depth;
      
      // Velocity: natural diagonal wind drift (flying right and down)
      this.vx = (Math.random() * 1.5 + 0.9) * this.depth;
      this.vy = (Math.random() * 1.2 + 0.7) * this.depth;

      // 3D Rotation Angles
      this.yaw = Math.random() * Math.PI * 2;         // 2D steering angle
      this.yawSpeed = (Math.random() - 0.5) * 0.025;
      this.pitch = Math.random() * Math.PI * 2;       // Tumbling end-over-end (flips)
      this.pitchSpeed = (Math.random() * 0.04 + 0.015);
      this.roll = Math.random() * Math.PI * 2;        // 3D rolling side-to-side
      this.rollSpeed = (Math.random() * 0.05 + 0.02);

      // Organic waving / floating physics
      this.floatPhase = Math.random() * Math.PI * 2;
      this.floatFreq = Math.random() * 0.03 + 0.015;
      this.floatAmp = Math.random() * 1.6 + 0.8;

      // Color and opacity
      this.palette = petalPalettes[Math.floor(Math.random() * petalPalettes.length)];
      this.opacity = (Math.random() * 0.35 + 0.55) * Math.min(1, this.depth + 0.15);

      // Curvature variation
      this.curve = Math.random() * 0.3 + 0.72;
    }

    update(time, globalWind) {
      // Wind oscillation waves (gusts and updrafts)
      const sway = Math.sin(time * this.floatFreq + this.floatPhase) * this.floatAmp;
      const updraft = Math.cos(time * (this.floatFreq * 0.85) + this.floatPhase) * (this.floatAmp * 0.5);

      // Interactive mouse breeze deflection
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      let mousePushX = 0;
      let mousePushY = 0;
      if (dist < 150) {
        const force = (1 - dist / 150) * 2.8;
        mousePushX = (mouse.vx * 0.45 + (dx / dist) * 1.6) * force;
        mousePushY = (mouse.vy * 0.45 + (dy / dist) * 1.6) * force;
        this.yawSpeed += (Math.random() - 0.5) * 0.035;
      }

      // Update position with wind drift + natural sway + interactive breeze
      this.x += this.vx * globalWind.x + sway + mousePushX;
      this.y += this.vy * globalWind.y + updraft + mousePushY;

      // 3D rotations
      this.yaw += this.yawSpeed;
      this.pitch += this.pitchSpeed;
      this.roll += this.rollSpeed;

      // Respawn when flying out of viewport
      if (this.y > canvas.height + 45 || this.x > canvas.width + 65 || this.x < -65) {
        this.reset(false);
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.yaw);

      // 3D Perspective Scale: tumbling in 3D air
      const scaleX = Math.cos(this.roll);
      const scaleY = Math.sin(this.pitch);
      ctx.scale(scaleX, scaleY);

      ctx.globalAlpha = Math.max(0.12, this.opacity * Math.abs(scaleX * scaleY * 0.5 + 0.5));

      // Soft drop shadow for foreground petals
      if (this.depth > 0.6) {
        ctx.shadowColor = this.palette.shadow;
        ctx.shadowBlur = 7 * this.depth;
        ctx.shadowOffsetX = 3 * scaleX;
        ctx.shadowOffsetY = 4 * scaleY;
      }

      // Organic botanical petal gradient
      const grad = ctx.createLinearGradient(0, -this.baseSize, 0, this.baseSize);
      grad.addColorStop(0, this.palette.tip);
      grad.addColorStop(0.55, this.palette.mid);
      grad.addColorStop(1, this.palette.base);
      ctx.fillStyle = grad;

      // Realistic curved botanical petal shape
      const w = this.baseSize * 0.78 * this.curve;
      const h = this.baseSize;

      ctx.beginPath();
      ctx.moveTo(0, -h);
      ctx.bezierCurveTo(w * 0.95, -h * 0.55, w * 0.85, h * 0.55, 0, h);
      ctx.bezierCurveTo(-w * 0.85, h * 0.55, -w * 0.95, -h * 0.55, 0, -h);
      ctx.fill();

      // Subtle center vein highlight on front side
      if (scaleX * scaleY > 0) {
        ctx.beginPath();
        ctx.moveTo(0, -h * 0.65);
        ctx.quadraticCurveTo(w * 0.1, 0, 0, h * 0.7);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  const petals = [];
  const petalCount = 42;
  for (let i = 0; i < petalCount; i++) {
    petals.push(new FlyingPetal(true));
  }

  const globalWind = { x: 1.15, y: 0.9 };

  function animatePetals(now) {
    const t = now * 0.001;
    // Dynamic breeze gust variation over time
    globalWind.x = 1.15 + Math.sin(t * 0.4) * 0.45 + Math.cos(t * 0.15) * 0.25;
    globalWind.y = 0.88 + Math.cos(t * 0.5) * 0.32;

    // Decay mouse velocity
    mouse.vx *= 0.92;
    mouse.vy *= 0.92;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const petal of petals) {
      petal.update(t, globalWind);
      petal.draw(ctx);
    }
    requestAnimationFrame(animatePetals);
  }
  requestAnimationFrame(animatePetals);

  // --- Light Vintage Watercolor Botanical Leaf Rain System (60 FPS Master Loop) ---
  let leafIdCounter = 0;
  const activeLeaves = [];
  let leafRafId = null;

  // Curated Light, Soft, Vintage Pastel Watercolor Palettes (NO dark/heavy tones)
  const vintageLeafPalettes = [
    // 1. Soft Frosted Hydrangea Sky Blue
    { a: '#f0f5fe', b: '#d3e4f9', c: '#adc8f0', stem: '#9cb9de' },
    // 2. Vintage Periwinkle Mist
    { a: '#f3f6fe', b: '#dbe3fb', c: '#b8c6f2', stem: '#a2b1df' },
    // 3. Antique Pastel Azure
    { a: '#edf4fb', b: '#d0e3f5', c: '#a9cbe8', stem: '#93b6d4' },
    // 4. Soft Lavender Petal
    { a: '#fcf4fd', b: '#edd7f6', c: '#d7b7e6', stem: '#c09ecd' },
    // 5. Vintage Lilac Wash
    { a: '#f9f0fb', b: '#ebd2ee', c: '#cfa9d7', stem: '#b68ebe' },
    // 6. Dusty Mauve Lilac
    { a: '#fbf2f9', b: '#eed6e7', c: '#d3b5cc', stem: '#bd9cb4' },
    // 7. Ethereal Blue-Violet Twilight
    { a: '#f3f4fd', b: '#dedff8', c: '#bcc0ec', stem: '#a5a9d9' },
    // 8. Soft Hydrangea Sage-Blue (matches bouquet leaf artwork on card)
    { a: '#f0f7f6', b: '#d6e9e7', c: '#b5d4d0', stem: '#9bbdb8' },
    // 9. Pale Wisteria Blossom
    { a: '#fbf6fe', b: '#efe0f8', c: '#d5bfe9', stem: '#bda4d2' },
    // 10. Vintage Cornflower Mist
    { a: '#f3f7fe', b: '#dbe7fb', c: '#bed3f5', stem: '#a4bee4' }
  ];

  function generateLeafSvg(palette, type, uid) {
    const { a, b, c, stem } = palette;
    if (type === 0) {
      // 1. Ovate Hydrangea Leaf with soft curved blade, stem & delicate lateral veins
      return `<svg viewBox="0 0 44 68" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="leaf_g_${uid}" x1="12%" y1="0%" x2="88%" y2="100%">
            <stop offset="0%" stop-color="${a}" stop-opacity="0.92"/>
            <stop offset="50%" stop-color="${b}" stop-opacity="0.86"/>
            <stop offset="100%" stop-color="${c}" stop-opacity="0.90"/>
          </linearGradient>
        </defs>
        <path d="M 22 4 C 36 14, 40 38, 24 57 C 22.5 59.5, 20.5 59.5, 19 57 C 3 38, 7 14, 22 4 Z" fill="url(#leaf_g_${uid})"/>
        <path d="M 21.5 56 Q 21.5 62 21.5 67" stroke="${stem}" stroke-width="1.3" stroke-linecap="round"/>
        <path d="M 22 6 Q 21.8 32 21.5 56" stroke="rgba(255, 255, 255, 0.85)" stroke-width="1.1" stroke-linecap="round"/>
        <path d="M 21.8 17 Q 29 14 34 17 M 21.8 17 Q 14 14 9 17" stroke="rgba(255, 255, 255, 0.65)" stroke-width="0.8" stroke-linecap="round"/>
        <path d="M 21.7 27 Q 31 24 36 28 M 21.7 27 Q 12 24 7 28" stroke="rgba(255, 255, 255, 0.65)" stroke-width="0.8" stroke-linecap="round"/>
        <path d="M 21.6 37 Q 30 35 34 39 M 21.6 37 Q 13 35 9 39" stroke="rgba(255, 255, 255, 0.6)" stroke-width="0.8" stroke-linecap="round"/>
        <path d="M 21.5 46 Q 27 45 30 49 M 21.5 46 Q 16 45 13 49" stroke="rgba(255, 255, 255, 0.55)" stroke-width="0.75" stroke-linecap="round"/>
      </svg>`;
    } else if (type === 1) {
      // 2. Slender Willow / Eucalyptus Leaflet with gentle arch & angled venation
      return `<svg viewBox="0 0 34 76" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="leaf_g_${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${a}" stop-opacity="0.92"/>
            <stop offset="50%" stop-color="${b}" stop-opacity="0.86"/>
            <stop offset="100%" stop-color="${c}" stop-opacity="0.90"/>
          </linearGradient>
        </defs>
        <path d="M 17 3 C 28 20, 27 54, 17 68 C 7 54, 6 20, 17 3 Z" fill="url(#leaf_g_${uid})"/>
        <path d="M 17 67 L 17 74" stroke="${stem}" stroke-width="1.3" stroke-linecap="round"/>
        <path d="M 17 5 Q 17.5 36 17 67" stroke="rgba(255, 255, 255, 0.85)" stroke-width="1" stroke-linecap="round"/>
        <path d="M 17 19 L 24 16 M 17 20 L 10 17 M 17 32 L 25 29 M 17 33 L 9 30 M 17 45 L 24 43 M 17 46 L 10 44 M 17 56 L 22 54 M 17 57 L 12 55" stroke="rgba(255, 255, 255, 0.6)" stroke-width="0.8" stroke-linecap="round"/>
      </svg>`;
    } else if (type === 2) {
      // 3. Heart-Ovate Lilac Leaf with delicate tip & light branching veins
      return `<svg viewBox="0 0 48 64" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="leaf_g_${uid}" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stop-color="${a}" stop-opacity="0.92"/>
            <stop offset="50%" stop-color="${b}" stop-opacity="0.86"/>
            <stop offset="100%" stop-color="${c}" stop-opacity="0.90"/>
          </linearGradient>
        </defs>
        <path d="M 24 4 C 40 15, 44 38, 26 55 C 24.5 57, 23.5 57, 22 55 C 4 38, 8 15, 24 4 Z" fill="url(#leaf_g_${uid})"/>
        <path d="M 24 54 L 24 63" stroke="${stem}" stroke-width="1.3" stroke-linecap="round"/>
        <path d="M 24 6 C 24.2 24 24.1 40 24 54" stroke="rgba(255, 255, 255, 0.85)" stroke-width="1.1" stroke-linecap="round"/>
        <path d="M 24 17 C 30 14 34 16 38 18 M 24 17 C 18 14 14 16 10 18" stroke="rgba(255, 255, 255, 0.65)" stroke-width="0.8" stroke-linecap="round"/>
        <path d="M 24 28 C 32 25 36 28 40 31 M 24 28 C 16 25 12 28 8 31" stroke="rgba(255, 255, 255, 0.65)" stroke-width="0.8" stroke-linecap="round"/>
        <path d="M 24 39 C 31 37 35 40 38 44 M 24 39 C 17 37 13 40 10 44" stroke="rgba(255, 255, 255, 0.6)" stroke-width="0.8" stroke-linecap="round"/>
      </svg>`;
    } else {
      // 4. Delicate Hydrangea Blossom Petal with translucent venation
      return `<svg viewBox="0 0 38 52" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="leaf_g_${uid}" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stop-color="${a}" stop-opacity="0.92"/>
            <stop offset="60%" stop-color="${b}" stop-opacity="0.86"/>
            <stop offset="100%" stop-color="${c}" stop-opacity="0.90"/>
          </linearGradient>
        </defs>
        <path d="M 19 3 C 32 10, 36 30, 22 46 C 20 49, 18 49, 16 46 C 2 30, 6 10, 19 3 Z" fill="url(#leaf_g_${uid})"/>
        <path d="M 19 45 L 19 51" stroke="${stem}" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M 19 6 Q 19 25 19 45" stroke="rgba(255, 255, 255, 0.8)" stroke-width="0.9" stroke-linecap="round"/>
        <path d="M 19 17 C 25 15 29 18 31 21 M 19 17 C 13 15 9 18 7 21" stroke="rgba(255, 255, 255, 0.6)" stroke-width="0.75" stroke-linecap="round"/>
        <path d="M 19 29 C 24 28 27 31 29 34 M 19 29 C 14 28 11 31 9 34" stroke="rgba(255, 255, 255, 0.55)" stroke-width="0.75" stroke-linecap="round"/>
      </svg>`;
    }
  }

  // Unified 60 FPS master animation loop for all raining leaves (Zero Lag)
  function animateAllLeaves(now) {
    if (activeLeaves.length === 0) {
      leafRafId = null;
      return;
    }

    const dt = 0.016;
    for (let i = activeLeaves.length - 1; i >= 0; i--) {
      const l = activeLeaves[i];
      const elapsed = (now - l.startTime) / 1000;

      if (l.isBurst) {
        l.vx *= 0.972;
        l.vy += l.gravity * dt;
        if (l.vy > l.maxVy) l.vy = l.maxVy;
      } else {
        l.vy += l.gravity * dt;
        if (l.vy > l.maxVy) l.vy = l.maxVy;
      }

      l.posX += l.vx * dt;
      l.posY += l.vy * dt;

      l.rotX += l.rotSpeedX;
      l.rotY += l.rotSpeedY;
      l.rotZ += l.rotSpeedZ;

      const sway = Math.sin(elapsed * l.flutterFreq + l.swayPhase) * l.flutterAmp;
      const scaleX = Math.cos(l.rotY * 0.01745) * 0.3 + 0.7;
      const scaleY = Math.sin(l.rotX * 0.01745) * 0.3 + 0.7;

      let opacity = 0.88;
      if (elapsed < 0.16) {
        opacity = (elapsed / 0.16) * 0.88;
      } else if (elapsed > l.lifespan - 1.0) {
        opacity = Math.max(0, ((l.lifespan - elapsed) / 1.0) * 0.88);
      }

      l.el.style.transform = `translate3d(${l.posX - l.originX + sway}px, ${l.posY - l.originY}px, 0) rotateZ(${l.rotZ}deg) scale3d(${scaleX}, ${scaleY}, 1)`;
      l.el.style.opacity = opacity;

      if (elapsed >= l.lifespan || l.posY > window.innerHeight + 80) {
        l.el.remove();
        activeLeaves.splice(i, 1);
      }
    }

    leafRafId = requestAnimationFrame(animateAllLeaves);
  }

  function startLeafAnimation() {
    if (!leafRafId && activeLeaves.length > 0) {
      leafRafId = requestAnimationFrame(animateAllLeaves);
    }
  }

  // --- Cascading Vintage Botanical Leaf Rain Shower ---
  function triggerBotanicalLeafRain(originX, originY) {
    const isMobile = window.innerWidth < 680;
    const burstCount = isMobile ? 14 : 18;
    const rainCount = isMobile ? 22 : 28;

    // 1. Center Blossom Eruption: bursts upward and wide across the entire card width
    for (let i = 0; i < burstCount; i++) {
      createRainingLeaf({
        originX: originX,
        originY: originY,
        isBurst: true,
        delay: Math.random() * 40
      });
    }

    // 2. Cascading Sky Rain: light vintage leaves showering from across the top canopy in waves
    for (let i = 0; i < rainCount; i++) {
      const delay = Math.random() * 1400; // Staggered over 1.4 seconds
      const startX = Math.random() * (window.innerWidth + 60) - 30;
      const startY = -Math.random() * 80 - 30;
      createRainingLeaf({
        originX: startX,
        originY: startY,
        isBurst: false,
        delay: delay
      });
    }
  }

  // Alias for backward compatibility
  function triggerBotanicalLeavesPop(originX, originY, count = 20) {
    triggerBotanicalLeafRain(originX, originY);
  }

  function createRainingLeaf(options) {
    const { originX, originY, isBurst, delay } = options;

    setTimeout(() => {
      leafIdCounter++;
      const uid = leafIdCounter;
      const leaf = document.createElement('div');
      leaf.className = 'botanical-leaf-particle';

      const palette = vintageLeafPalettes[Math.floor(Math.random() * vintageLeafPalettes.length)];
      const type = Math.floor(Math.random() * 4);

      let width, height;
      if (type === 1) {
        width = Math.random() * 4 + 15;
        height = Math.random() * 8 + 34;
      } else {
        width = Math.random() * 6 + 18;
        height = Math.random() * 8 + 28;
      }

      leaf.style.width = `${width}px`;
      leaf.style.height = `${height}px`;
      leaf.style.left = `${originX}px`;
      leaf.style.top = `${originY}px`;
      leaf.style.opacity = '0';

      leaf.innerHTML = generateLeafSvg(palette, type, uid);
      document.body.appendChild(leaf);

      let posX = originX - width / 2;
      let posY = originY - height / 2;

      let vx, vy, maxVy, gravity;
      if (isBurst) {
        const maxSpread = Math.min(window.innerWidth * 0.82, 460);
        vx = (Math.random() - 0.5) * maxSpread * 1.25;
        vy = -Math.random() * 210 - 95;
        gravity = 185;
        maxVy = 155;
      } else {
        vx = (Math.random() - 0.22) * 55;
        vy = Math.random() * 75 + 110;
        gravity = 38;
        maxVy = 160;
      }

      const leafObj = {
        el: leaf,
        originX: originX,
        originY: originY,
        posX: posX,
        posY: posY,
        vx: vx,
        vy: vy,
        maxVy: maxVy,
        gravity: gravity,
        isBurst: isBurst,
        rotX: Math.random() * 360,
        rotY: Math.random() * 360,
        rotZ: Math.random() * 360,
        rotSpeedX: (Math.random() - 0.5) * 2.4,
        rotSpeedY: (Math.random() - 0.5) * 2.8,
        rotSpeedZ: (Math.random() - 0.5) * 1.9,
        flutterFreq: Math.random() * 2.5 + 1.8,
        flutterAmp: Math.random() * 32 + 18,
        swayPhase: Math.random() * Math.PI * 2,
        startTime: performance.now(),
        lifespan: isBurst ? 5.0 : 5.8
      };

      activeLeaves.push(leafObj);
      startLeafAnimation();
    }, delay);
  }

  function spawnBloomPetals(cx, cy, count = 28) {
    if (!canvas || !petals) return;
    for (let i = 0; i < count; i++) {
      const p = new FlyingPetal(false);
      // Spread across the top of the canvas to rain down
      p.x = Math.random() * (canvas.width + 120) - 60;
      p.y = -Math.random() * 80 - 20;
      p.vx = (Math.random() * 2.0 + 0.8);
      p.vy = (Math.random() * 2.2 + 1.4); // steady downward fall
      // Blue & purple palettes
      p.palette = Math.random() > 0.5 ? petalPalettes[1] : petalPalettes[0];
      petals.push(p);
      if (petals.length > 80) petals.shift();
    }
  }

  // --- Confetti & Particles System ---
  function triggerConfetti(originX, originY, customColors = null) {
    const colors = customColors || ['#d4af37', '#ffd700', '#dfc3d6', '#a98fa8', '#ffffff'];
    const count = 35;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-particle';
      document.body.appendChild(p);

      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 8 + 6;
      p.style.backgroundColor = color;
      p.style.width = `${size}px`;
      p.style.height = `${size * 0.7}px`;
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      p.style.left = `${originX}px`;
      p.style.top = `${originY}px`;

      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 180 + 70;
      const vx = Math.cos(angle) * velocity;
      const vy = Math.sin(angle) * velocity - 90;

      let posX = originX;
      let posY = originY;
      let curVy = vy;
      let rotation = Math.random() * 360;
      let opacity = 1;

      const startTime = performance.now();
      function updateParticle(time) {
        const elapsed = (time - startTime) / 1000;
        posX += vx * 0.016;
        posY += curVy * 0.016;
        curVy += 280 * 0.016; // gravity
        rotation += 8;
        opacity -= 0.012;

        p.style.transform = `translate(${posX - originX}px, ${posY - originY}px) rotate(${rotation}deg)`;
        p.style.opacity = Math.max(0, opacity);

        if (opacity > 0 && posY < window.innerHeight + 100) {
          requestAnimationFrame(updateParticle);
        } else {
          p.remove();
        }
      }
      requestAnimationFrame(updateParticle);
    }
  }

  function createGoldBurst(element) {
    const rect = element.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    triggerConfetti(cx, cy, ['#ffd700', '#e6b800', '#fff0a6', '#d4af37', '#eed5e5']);
  }

  // --- Countdown Timer ---
  function updateCountdown() {
    const target = new Date(weddingData.targetDate).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-mins');
    const secsEl = document.getElementById('cd-secs');

    if (diff <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(d).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(m).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(s).padStart(2, '0');
  }
  setInterval(updateCountdown, 1000);
  updateCountdown();

  // --- Modal Management ---
  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(btn.dataset.close);
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('active');
      }
    });
  });

  // Dock Buttons Handlers
  document.getElementById('dock-rsvp').addEventListener('click', () => openModal('modal-rsvp'));
  document.getElementById('dock-calendar').addEventListener('click', () => openModal('modal-calendar'));
  document.getElementById('dock-venue').addEventListener('click', () => openModal('modal-venue'));
  document.getElementById('dock-countdown').addEventListener('click', () => openModal('modal-countdown'));
  document.getElementById('dock-share').addEventListener('click', () => openModal('modal-share'));
  if (editBtn) {
    editBtn.addEventListener('click', () => openModal('modal-edit'));
  }

  // --- RSVP Logic & Local Storage ---
  const rsvpForm = document.getElementById('rsvp-form');
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('rsvp-name').value.trim();
    const attending = document.querySelector('input[name="attendance"]:checked').value;
    const guests = document.getElementById('rsvp-guests').value;
    const dietary = document.getElementById('rsvp-dietary').value.trim();
    const message = document.getElementById('rsvp-message').value.trim();

    const rsvpEntry = {
      name,
      attending,
      guests,
      dietary,
      message,
      submittedAt: new Date().toLocaleString()
    };

    let existing = [];
    try {
      existing = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
    } catch (err) {
      existing = [];
    }
    existing.push(rsvpEntry);
    localStorage.setItem('wedding_rsvps', JSON.stringify(existing));

    closeModal('modal-rsvp');
    triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);

    alert(`Thank you so much, ${name}!\nYour RSVP has been joyfully received.`);
    rsvpForm.reset();
  });

  // RSVP List Admin View
  const viewRsvpsBtn = document.getElementById('view-rsvps-btn');
  const modalRsvplist = document.getElementById('modal-rsvplist');
  const rsvpListContainer = document.getElementById('rsvp-list-container');
  const rsvpSummaryText = document.getElementById('rsvp-summary-text');

  viewRsvpsBtn.addEventListener('click', () => {
    closeModal('modal-rsvp');
    renderRsvpList();
    openModal('modal-rsvplist');
  });

  function renderRsvpList() {
    let rsvps = [];
    try {
      rsvps = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
    } catch (e) {
      rsvps = [];
    }

    rsvpSummaryText.textContent = `${rsvps.length} response${rsvps.length === 1 ? '' : 's'} recorded`;

    if (rsvps.length === 0) {
      rsvpListContainer.innerHTML = '<p style="text-align:center; color:#888; padding:20px; font-style:italic;">No RSVPs yet. They will appear here as guests respond!</p>';
      return;
    }

    rsvpListContainer.innerHTML = rsvps.map((r, i) => `
      <div style="border-bottom: 1px solid #ebdbe6; padding: 10px 0; font-family: 'Montserrat', sans-serif; font-size: 0.85rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <strong style="color:#2a1b28;">${r.name}</strong>
          <span style="color:${r.attending === 'Joyfully Accepts' ? '#2e7d32' : '#c62828'}; font-weight:600;">${r.attending}</span>
        </div>
        <div style="color:#665564; font-size:0.78rem;">Party size: ${r.guests} ${r.dietary ? '• Diet: ' + r.dietary : ''}</div>
        ${r.message ? `<div style="font-style:italic; margin-top:4px; color:#493547;">"${r.message}"</div>` : ''}
        <div style="font-size:0.7rem; color:#a18fa0; margin-top:4px;">${r.submittedAt}</div>
      </div>
    `).join('');
  }

  document.getElementById('btn-clear-rsvps').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all recorded RSVPs?')) {
      localStorage.removeItem('wedding_rsvps');
      renderRsvpList();
    }
  });

  document.getElementById('btn-export-rsvps').addEventListener('click', () => {
    let rsvps = [];
    try {
      rsvps = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
    } catch (e) {
      rsvps = [];
    }

    if (rsvps.length === 0) {
      alert('No RSVPs to export yet.');
      return;
    }

    let csvContent = 'Name,Attendance,Guests,Dietary,Message,Date\n';
    rsvps.forEach(r => {
      csvContent += `"${r.name}","${r.attending}","${r.guests}","${r.dietary}","${r.message}","${r.submittedAt}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Wedding_RSVPs_${weddingData.brideFirst}_and_${weddingData.groomFirst}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  });

  // --- Add to Calendar (.ics & Google Calendar) ---
  const btnGoogleCal = document.getElementById('btn-google-cal');
  const btnDownloadIcs = document.getElementById('btn-download-ics');

  function updateCalendarLinks() {
    const title = encodeURIComponent(`The Wedding Celebrations of ${weddingData.groomName}`);
    const details = encodeURIComponent(
      `Mehndi Ceremony: ${weddingData.dateMehndi} (${weddingData.timeMehndi})\n` +
      `Barat Ceremony: ${weddingData.dateBarat} (${weddingData.timeBarat})\n` +
      `Walima Ceremony: ${weddingData.dateWalima} (${weddingData.timeWalima})\n` +
      `Venue: ${weddingData.venueName}, ${weddingData.venueAddress}\n` +
      `${weddingData.hostLine}\n${weddingData.banquetLine}`
    );
    const location = encodeURIComponent(`${weddingData.venueName}, ${weddingData.venueAddress}`);
    
    // 2026-10-29 14:00 UTC (7:00 PM PKT) to 2026-10-31 18:00 UTC
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20261029T140000Z/20261031T180000Z&details=${details}&location=${location}`;
    if (btnGoogleCal) btnGoogleCal.href = gCalUrl;
  }
  updateCalendarLinks();

  btnDownloadIcs.addEventListener('click', () => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Wedding Invitation//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + Date.now() + '@weddinginvite',
      'DTSTAMP:20261001T000000Z',
      'DTSTART:20261029T140000Z',
      'DTEND:20261031T180000Z',
      `SUMMARY:The Wedding Celebrations of ${weddingData.groomName}`,
      `DESCRIPTION:Mehndi: 29 Oct • Barat: 30 Oct • Walima: 31 Oct. Hosted by Mr. & Mrs. Irshad Ahmed at Paris Marriage Hall, Gujranwala.`,
      `LOCATION:${weddingData.venueName}, ${weddingData.venueAddress}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Wedding_Celebrations_Bilal_Ahmed.ics`;
    link.click();
    URL.revokeObjectURL(url);
  });

  // --- Copy Address ---
  document.getElementById('btn-copy-address').addEventListener('click', () => {
    const addr = `${weddingData.venueName}, ${weddingData.venueAddress}`;
    navigator.clipboard.writeText(addr).then(() => {
      alert('Venue address copied to clipboard!');
    });
  });

  // --- Share & WhatsApp Integration ---
  const btnShareWhatsapp = document.getElementById('btn-share-whatsapp');
  const btnCopyShareLink = document.getElementById('btn-copy-share-link');
  const personalizeGuestInput = document.getElementById('personalize-guest-input');
  const shareCopiedNotice = document.getElementById('share-copied-notice');

  function getShareUrl() {
    const baseUrl = window.location.origin + window.location.pathname;
    const guest = personalizeGuestInput.value.trim();
    const url = new URL(baseUrl);
    if (guest) {
      url.searchParams.set('guest', guest);
    }
    if (currentTheme === 'gouache') {
      url.searchParams.set('theme', 'gouache');
    }
    if (activeRevealMode) {
      url.searchParams.set('reveal', activeRevealMode);
    }
    return url.toString();
  }

  btnShareWhatsapp.addEventListener('click', () => {
    const shareUrl = getShareUrl();
    const guest = personalizeGuestInput.value.trim();
    const greeting = guest ? `Dear ${guest}, ` : 'Dear Family & Friends, ';
    const text = encodeURIComponent(
      `${greeting}You are cordially invited to the Wedding Celebrations of ${weddingData.groomName}!\n\n` +
      `🌸 Mehndi: ${weddingData.dateMehndi} (${weddingData.timeMehndi})\n` +
      `✨ Barat: ${weddingData.dateBarat} (${weddingData.timeBarat})\n` +
      `👑 Walima: ${weddingData.dateWalima} (${weddingData.timeWalima})\n` +
      `📍 Venue: ${weddingData.venueName}, ${weddingData.venueAddress}\n` +
      `💌 ${weddingData.hostLine}\n` +
      `🍽️ ${weddingData.banquetLine}\n\n` +
      `View our digital invitation card here:\n${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  });

  btnCopyShareLink.addEventListener('click', () => {
    const shareUrl = getShareUrl();
    navigator.clipboard.writeText(shareUrl).then(() => {
      shareCopiedNotice.style.display = 'block';
      setTimeout(() => {
        shareCopiedNotice.style.display = 'none';
      }, 3500);
    });
  });

  // --- Save / Download Card Image (High Resolution) ---
  document.getElementById('dock-save-image').addEventListener('click', () => {
    const btn = document.getElementById('dock-save-image');
    btn.innerHTML = '<span>⏳</span> Generating...';

    // Temporarily remove 3D transform for clean capture
    const prevTransform = weddingCard.style.transform;
    weddingCard.style.transform = 'none';

    html2canvas(weddingCard, {
      scale: 3, // 3x ultra-sharp retina capture
      useCORS: true,
      backgroundColor: null,
      logging: false
    }).then(canvas => {
      weddingCard.style.transform = prevTransform;
      btn.innerHTML = '<span>🖼️</span> Save Image';

      const image = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = image;
      a.download = `Wedding_Invitation_Bilal_Ahmed.png`;
      a.click();
      triggerConfetti(window.innerWidth / 2, window.innerHeight / 2);
    }).catch(err => {
      console.error(err);
      weddingCard.style.transform = prevTransform;
      btn.innerHTML = '<span>🖼️</span> Save Image';
      alert('Could not generate image automatically. You can also print or screenshot the card directly!');
    });
  });

  // --- Live Customization Form ---
  const editForm = document.getElementById('edit-form');
  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    weddingData.groomName = document.getElementById('edit-groom-name').value.trim();
    weddingData.hostLine = document.getElementById('edit-host').value.trim();
    weddingData.letterQuote = document.getElementById('edit-letter').value.trim();
    weddingData.venueName = document.getElementById('edit-venue-name').value.trim();
    weddingData.venueAddress = document.getElementById('edit-venue-addr').value.trim();
    weddingData.banquetLine = document.getElementById('edit-banquet').value.trim();

    localStorage.setItem('wedding_card_data_v2', JSON.stringify(weddingData));
    renderCardText();
    updateCalendarLinks();
    closeModal('modal-edit');
    triggerConfetti(window.innerWidth / 2, 100);
  });

  document.getElementById('btn-reset-defaults').addEventListener('click', () => {
    if (confirm('Reset to original card details (Bilal Ahmed)?')) {
      weddingData = { ...defaultData };
      localStorage.removeItem('wedding_card_data_v2');
      if (document.getElementById('edit-groom-name')) document.getElementById('edit-groom-name').value = defaultData.groomName;
      if (document.getElementById('edit-host')) document.getElementById('edit-host').value = defaultData.hostLine;
      if (document.getElementById('edit-letter')) document.getElementById('edit-letter').value = defaultData.letterQuote;
      if (document.getElementById('edit-venue-name')) document.getElementById('edit-venue-name').value = defaultData.venueName;
      if (document.getElementById('edit-venue-addr')) document.getElementById('edit-venue-addr').value = defaultData.venueAddress;
      if (document.getElementById('edit-banquet')) document.getElementById('edit-banquet').value = defaultData.banquetLine;
      renderCardText();
      updateCalendarLinks();
      closeModal('modal-edit');
    }
  });

  // --- Extended Wedding Sections Interactions ---

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 1. Scroll hint click
  const scrollHintBtn = document.getElementById('scroll-hint');
  if (scrollHintBtn) {
    scrollHintBtn.addEventListener('click', () => {
      const targetEl = document.getElementById('card-event-mehndi') || document.getElementById('wedding-details-flow');
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // 2. Bottom Dock Section Jumps
  const dockScheduleBtn = document.getElementById('dock-schedule');
  if (dockScheduleBtn) {
    dockScheduleBtn.addEventListener('click', () => {
      const el = document.getElementById('section-schedule');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const dockStoryBtn = document.getElementById('dock-story');
  if (dockStoryBtn) {
    dockStoryBtn.addEventListener('click', () => {
      const el = document.getElementById('section-story');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  const dockGuestbookBtn = document.getElementById('dock-guestbook');
  if (dockGuestbookBtn) {
    dockGuestbookBtn.addEventListener('click', () => {
      const el = document.getElementById('section-guestbook');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // 3. FAQ Accordion Toggle
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      if (!item) return;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // 4. Copy Venue Address
  const btnCopyVenue = document.getElementById('btn-copy-venue-address');
  if (btnCopyVenue) {
    btnCopyVenue.addEventListener('click', () => {
      const addr = 'Paris Marriage Hall, Opposite Second Cup, G.T. Road, Eminabad Morr, Gujranwala, Punjab, Pakistan';
      navigator.clipboard.writeText(addr).then(() => {
        const origText = btnCopyVenue.innerHTML;
        btnCopyVenue.innerHTML = '✓ Copied Address!';
        btnCopyVenue.style.color = '#2e7d32';
        setTimeout(() => {
          btnCopyVenue.innerHTML = origText;
          btnCopyVenue.style.color = '';
        }, 2200);
      });
    });
  }

  // 5. Wishing Well buttons
  const btnWishingInfo = document.getElementById('btn-wishing-info');
  if (btnWishingInfo) {
    btnWishingInfo.addEventListener('click', () => {
      alert('💌 A warm welcome and reception greeting table will be available at the main foyer of Paris Marriage Hall. Thank you for your warm blessings & prayers!');
    });
  }

  const btnJumpGuestbook = document.getElementById('btn-jump-guestbook');
  if (btnJumpGuestbook) {
    btnJumpGuestbook.addEventListener('click', () => {
      const el = document.getElementById('section-guestbook');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // 6. Footer Buttons
  const footerRsvpBtn = document.getElementById('footer-rsvp-btn');
  if (footerRsvpBtn) {
    footerRsvpBtn.addEventListener('click', () => openModal('modal-rsvp'));
  }

  const footerTopBtn = document.getElementById('footer-top-btn');
  if (footerTopBtn) {
    footerTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 7. Interactive Digital Guestbook
  const defaultGuestWishes = [
    {
      name: 'Tariq Mehmood & Family',
      relation: 'Family & Relatives',
      text: 'Heartiest congratulations to our dear Bilal Ahmed! May Almighty Allah shower His countless blessings and barakah upon your wedding celebrations and new journey.',
      time: 'October 20, 2026'
    },
    {
      name: 'Hamza Farooq',
      relation: 'Friend of the Groom',
      text: 'From school days to your wedding days, so proud and happy to celebrate this monumental milestone with you, Bilal! Wishing you endless joy and happiness!',
      time: 'October 21, 2026'
    },
    {
      name: 'Usman & Ayesha',
      relation: 'Cousins',
      text: 'Warmest prayers and heartfelt congratulations to Bilal and uncle Irshad Ahmed’s family! Looking forward to an unforgettable three days of celebrations!',
      time: 'October 22, 2026'
    }
  ];

  function renderGuestbook() {
    const wall = document.getElementById('guestbook-wall');
    if (!wall) return;
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem('bilal_guestbook_wishes')) || [];
    } catch (e) {
      saved = [];
    }
    const allWishes = [...saved, ...defaultGuestWishes];
    wall.innerHTML = allWishes.map(w => `
      <div class="guest-wish-card">
        <div class="guest-wish-header">
          <span class="guest-wish-author">${escapeHtml(w.name)}</span>
          <span class="guest-wish-relation">${escapeHtml(w.relation)}</span>
        </div>
        <div class="guest-wish-text">"${escapeHtml(w.text)}"</div>
        <div class="guest-wish-time">${escapeHtml(w.time)}</div>
      </div>
    `).join('');
  }

  const gbForm = document.getElementById('guestbook-form');
  if (gbForm) {
    gbForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('gb-name').value.trim();
      const relation = document.getElementById('gb-relation').value;
      const message = document.getElementById('gb-message').value.trim();
      if (!name || !message) return;

      const newWish = {
        name: name,
        relation: relation,
        text: message,
        time: 'Just now'
      };

      let saved = [];
      try {
        saved = JSON.parse(localStorage.getItem('bilal_guestbook_wishes')) || [];
      } catch (err) {
        saved = [];
      }
      saved.unshift(newWish);
      localStorage.setItem('bilal_guestbook_wishes', JSON.stringify(saved));
      renderGuestbook();
      gbForm.reset();

      // Mini celebration confetti burst
      triggerConfetti(window.innerWidth / 2, window.innerHeight * 0.75, ['#dfc3d6', '#baa5b7', '#d4af37', '#ffffff']);
    });
  }

  renderGuestbook();

  // Initialize
  initData();
});
