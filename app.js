/* ==========================================================================
   SHAKTHI SAFESPHERE - CORE LOGIC (TechFusion Team)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // Initialize System Clock
  initClock();

  // Initialize Application State
  window.appState = {
    sosActive: false,
    sirenActive: false,
    recordingActive: false,
    telemetryStreaming: true,
    currentBattery: 98,
    signalStrength: 'Strong (LTE)',
    currentLat: 17.392014, // Starts near CBIT Hostels, Hyderabad
    currentLng: 78.324208,
    speed: 0,
    timeElapsed: 0,
    activeRoute: null,
    isOnline: navigator.onLine,
    offlineQueue: JSON.parse(localStorage.getItem('shakthi_telemetry_queue') || '[]'),
    shakeActive: false
  };

  // Initialize Modules
  initSOS();
  initSiren();
  initFakeCall();
  initAudioVault();
  initTelemetryLog();
  initContactsEditor();
  initConnectivityMonitor();
  initArrivalVerification();
  initHazardReporting();
});

/* ==========================================================================
   1. SYSTEM CLOCK
   ========================================================================== */
function initClock() {
  const clockEl = document.getElementById('system-clock');
  const updateClock = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hoursStr = String(hours).padStart(2, '0');
    clockEl.textContent = `${hoursStr}:${minutes}:${seconds} ${ampm}`;
  };
  updateClock();
  setInterval(updateClock, 1000);
}

/* ==========================================================================
   2. SOS EMERGENCY WIDGET
   ========================================================================== */
function initSOS() {
  const sosTrigger = document.getElementById('sos-trigger');
  const countdownOverlay = document.getElementById('sos-countdown-container');
  const countdownNum = document.getElementById('sos-countdown-num');
  const cancelSosBtn = document.getElementById('cancel-sos');
  const activeOverlay = document.getElementById('sos-active-alert');
  const deactivateSosBtn = document.getElementById('deactivate-sos');
  const statusIndicator = document.querySelector('.status-indicator');
  const statusText = document.querySelector('.status-text');

  // Emergency overlay specific buttons
  const emergencyToggleSiren = document.getElementById('emergency-toggle-siren');
  const emergencyCallGuardian = document.getElementById('emergency-call-guardian');

  let countdownInterval = null;
  let countdownCount = 3;

  const triggerSOSCountdown = () => {
    countdownCount = 3;
    countdownNum.textContent = countdownCount;
    countdownOverlay.classList.add('show');
    
    // Animate SVGs progress ring
    const circle = document.querySelector('.progress-ring__circle');
    if (circle) {
      circle.style.strokeDashoffset = '0';
      // Total circumference is 326.7. Shrink offset to 326.7 over 3s
      let offset = 0;
      const totalCircumference = 326.7;
      circle.style.strokeDashoffset = totalCircumference;
    }

    countdownInterval = setInterval(() => {
      countdownCount--;
      countdownNum.textContent = countdownCount;
      
      const circle = document.querySelector('.progress-ring__circle');
      if (circle) {
        const percent = (3 - countdownCount) / 3;
        circle.style.strokeDashoffset = 326.7 - (326.7 * percent);
      }

      if (countdownCount <= 0) {
        clearInterval(countdownInterval);
        activateEmergency();
      }
    }, 1000);
  };

  const cancelSOS = () => {
    clearInterval(countdownInterval);
    countdownOverlay.classList.remove('show');
    logTelemetryEntry("Uplink", "SOS Cancelled", "--", "--");
  };

  const activateEmergency = () => {
    window.appState.sosActive = true;
    countdownOverlay.classList.remove('show');
    activeOverlay.classList.add('show');

    // UI Updates
    statusIndicator.className = "status-indicator emergency";
    statusText.textContent = "EMERGENCY BROADCAST";
    
    // Play sound alarm programmatically if not already running
    if (!window.appState.sirenActive) {
      toggleSirenAlarm(true);
    }

    // Update Guardian number link dynamically on launch
    const guardianPhone = document.getElementById('contact-p-phone').textContent.trim();
    if (emergencyCallGuardian && guardianPhone) {
      emergencyCallGuardian.setAttribute('href', `tel:${guardianPhone.replace(/\s+/g, '')}`);
    }

    // Append to telemetry logs
    logTelemetryEntry("CRITICAL", "SOS BROADCAST ACTIVE", "0 km/h", "ALERT");

    // Send mock SMS/WhatsApp broadcasts
    console.log("Mock SMS Sent to " + document.getElementById('contact-p-phone').textContent);
    console.log("Mock WhatsApp Alert sent via API to " + document.getElementById('contact-s-phone').textContent);
    
    // Focus map and trigger visual hazard circle
    if (window.mapModule && typeof window.mapModule.triggerEmergencyOnMap === 'function') {
      window.mapModule.triggerEmergencyOnMap();
    }
  };

  // Expose to window for arrival check-in fallback
  window.activateEmergencyBroadcast = activateEmergency;

  const deactivateEmergency = () => {
    window.appState.sosActive = false;
    activeOverlay.classList.remove('show');

    // UI Updates
    statusIndicator.className = "status-indicator live";
    statusText.textContent = "Telemetry Active";

    if (window.appState.sirenActive) {
      toggleSirenAlarm(false);
    }

    logTelemetryEntry("Uplink", "SOS Deactivated", "0 km/h", "Standby");
    
    if (window.mapModule && typeof window.mapModule.clearEmergencyOnMap === 'function') {
      window.mapModule.clearEmergencyOnMap();
    }
  };

  // Add event listeners
  sosTrigger.addEventListener('click', triggerSOSCountdown);
  cancelSosBtn.addEventListener('click', cancelSOS);
  deactivateSosBtn.addEventListener('click', deactivateEmergency);

  // Hook up emergency screen toggle siren button
  if (emergencyToggleSiren) {
    emergencyToggleSiren.addEventListener('click', () => {
      toggleSirenAlarm(!window.appState.sirenActive);
    });
  }
}

/* ==========================================================================
   3. SIREN ALARM MODULE (Web Audio API Synthesizer)
   ========================================================================== */
let audioCtx = null;
let sirenOscillator = null;
let sirenOscillator2 = null;
let sirenGain = null;
let sirenSweepInterval = null;

function initSiren() {
  const toggleSirenBtn = document.getElementById('toggle-siren');
  const sirenWidget = document.getElementById('widget-siren');

  toggleSirenBtn.addEventListener('click', () => {
    toggleSirenAlarm(!window.appState.sirenActive);
  });
}

function toggleSirenAlarm(activate) {
  const toggleSirenBtn = document.getElementById('toggle-siren');
  const sirenWidget = document.getElementById('widget-siren');
  const sirenStatus = document.getElementById('siren-status-text');
  const sirenIcon = sirenWidget ? sirenWidget.querySelector('.action-icon') : null;

  // Emergency overlay elements
  const emergencySirenBtn = document.getElementById('emergency-toggle-siren');
  const emergencySirenStatus = document.getElementById('emergency-siren-status');
  const emergencySirenDesc = document.getElementById('emergency-siren-desc');

  if (activate) {
    window.appState.sirenActive = true;
    if (toggleSirenBtn) toggleSirenBtn.classList.add('active');
    if (sirenIcon) sirenIcon.classList.add('active');
    if (sirenStatus) {
      sirenStatus.textContent = "ACTIVE (Loud)";
      sirenStatus.style.color = "var(--color-crimson)";
    }
    logTelemetryEntry("Safety", "Siren Enabled", "--", "--");
    startSirenSound();

    // Update Emergency Overlay Siren button
    if (emergencySirenBtn) {
      emergencySirenBtn.classList.add('siren-active');
    }
    if (emergencySirenStatus) {
      emergencySirenStatus.textContent = "Siren ON (Loud)";
    }
    if (emergencySirenDesc) {
      emergencySirenDesc.textContent = "Tap to silence alarm";
    }
  } else {
    window.appState.sirenActive = false;
    if (toggleSirenBtn) toggleSirenBtn.classList.remove('active');
    if (sirenIcon) sirenIcon.classList.remove('active');
    if (sirenStatus) {
      sirenStatus.textContent = "Inactive";
      sirenStatus.style.color = "";
    }
    logTelemetryEntry("Safety", "Siren Disabled", "--", "--");
    stopSirenSound();

    // Update Emergency Overlay Siren button
    if (emergencySirenBtn) {
      emergencySirenBtn.classList.remove('siren-active');
    }
    if (emergencySirenStatus) {
      emergencySirenStatus.textContent = "Toggle Siren";
    }
    if (emergencySirenDesc) {
      emergencySirenDesc.textContent = "Loud acoustic beacon";
    }
  }
}

function startSirenSound() {
  try {
    // Create AudioContext if not initialized
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Create oscillator nodes
    sirenOscillator = audioCtx.createOscillator();
    sirenOscillator2 = audioCtx.createOscillator();
    sirenGain = audioCtx.createGain();

    sirenOscillator.type = 'sawtooth';
    sirenOscillator2.type = 'sine';

    // Volume level
    sirenGain.gain.setValueAtTime(0.15, audioCtx.currentTime);

    sirenOscillator.connect(sirenGain);
    sirenOscillator2.connect(sirenGain);
    sirenGain.connect(audioCtx.destination);

    sirenOscillator.start();
    sirenOscillator2.start();

    // Frequency sweep interval (Police Siren: alternates between high and low pitches)
    let pitchToggle = true;
    sirenSweepInterval = setInterval(() => {
      const now = audioCtx.currentTime;
      if (pitchToggle) {
        // High Pitch Sweep
        sirenOscillator.frequency.exponentialRampToValueAtTime(960, now + 0.35);
        sirenOscillator2.frequency.exponentialRampToValueAtTime(980, now + 0.35);
      } else {
        // Low Pitch Sweep
        sirenOscillator.frequency.exponentialRampToValueAtTime(630, now + 0.35);
        sirenOscillator2.frequency.exponentialRampToValueAtTime(650, now + 0.35);
      }
      pitchToggle = !pitchToggle;
    }, 400);

  } catch (error) {
    console.warn("Web Audio API not supported or blocked: ", error);
  }
}

function stopSirenSound() {
  if (sirenSweepInterval) {
    clearInterval(sirenSweepInterval);
    sirenSweepInterval = null;
  }
  if (sirenOscillator) {
    try {
      sirenOscillator.stop();
      sirenOscillator2.stop();
    } catch (e) {}
    sirenOscillator = null;
    sirenOscillator2 = null;
  }
  if (sirenGain) {
    sirenGain.disconnect();
    sirenGain = null;
  }
}

/* ==========================================================================
   4. FAKE CALL SIMULATOR
   ========================================================================== */
let fakeCallAudioInterval = null;
let fakeCallAudioCtx = null;

function initFakeCall() {
  const triggerBtn = document.getElementById('trigger-fakecall');
  const screenOverlay = document.getElementById('fake-call-screen');
  const declineBtn = document.getElementById('decline-fakecall');
  const acceptBtn = document.getElementById('accept-fakecall');
  
  // Shake configuration elements
  const toggleShakeBtn = document.getElementById('toggle-shake-call');
  const shakeStatusText = document.getElementById('shake-status-text');

  const triggerCallInstantly = () => {
    logTelemetryEntry("Safety", "Incoming Fake Call Active", "--", "--");
    screenOverlay.classList.add('active');
    startFakeCallRing();
  };

  triggerBtn.addEventListener('click', () => {
    logTelemetryEntry("Safety", "Scheduling Fake Call...", "--", "--");
    // 2-second delay to allow putting phone down/away
    setTimeout(() => {
      triggerCallInstantly();
    }, 2000);
  });

  const stopCall = (action) => {
    screenOverlay.classList.remove('active');
    stopFakeCallRing();
    logTelemetryEntry("Safety", `Fake Call ${action}`, "--", "--");
  };

  declineBtn.addEventListener('click', () => stopCall("Declined"));
  acceptBtn.addEventListener('click', () => stopCall("Accepted"));

  // Shake to Trigger Switch logic
  if (toggleShakeBtn) {
    toggleShakeBtn.addEventListener('click', () => {
      const active = !window.appState.shakeActive;
      window.appState.shakeActive = active;
      
      if (active) {
        toggleShakeBtn.classList.add('active');
        shakeStatusText.textContent = "Shake to Trigger: ON";
        shakeStatusText.style.color = "var(--color-emerald)";
        logTelemetryEntry("Safety", "Shake-to-Decoy Activated", "--", "--");
        
        // Request Device Motion permissions on mobile if supported
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
          DeviceMotionEvent.requestPermission()
            .then(permissionState => {
              if (permissionState === 'granted') {
                console.log("DeviceMotion sensor access granted.");
              } else {
                console.warn("DeviceMotion access denied.");
                shakeStatusText.textContent = "Shake to Trigger: Permission Denied";
                shakeStatusText.style.color = "var(--color-crimson)";
              }
            })
            .catch(err => {
              console.error("Error requesting DeviceMotion permission: ", err);
            });
        }
      } else {
        toggleShakeBtn.classList.remove('active');
        shakeStatusText.textContent = "Shake to Trigger: OFF";
        shakeStatusText.style.color = "";
        logTelemetryEntry("Safety", "Shake-to-Decoy Deactivated", "--", "--");
      }
    });
  }

  // Device Motion Shake detection event
  let lastX = null, lastY = null, lastZ = null;
  let lastUpdate = 0;
  
  window.addEventListener('devicemotion', (event) => {
    if (!window.appState.shakeActive) return;
    
    // Prevent shake trigger if the decoy screen is already active
    if (screenOverlay.classList.contains('active')) return;

    const acceleration = event.accelerationIncludingGravity || event.acceleration;
    if (!acceleration) return;

    const curTime = Date.now();
    if ((curTime - lastUpdate) > 100) {
      const diffTime = curTime - lastUpdate;
      lastUpdate = curTime;

      const x = acceleration.x;
      const y = acceleration.y;
      const z = acceleration.z;

      if (lastX !== null) {
        // Calculate motion delta
        const deltaX = Math.abs(x - lastX);
        const deltaY = Math.abs(y - lastY);
        const deltaZ = Math.abs(z - lastZ);
        
        // Compute speed index based on acceleration change over time
        const speed = (deltaX + deltaY + deltaZ) / diffTime * 10000;
        
        // Threshold check: 18+ represents sudden shaking force
        if (speed > 18) {
          logTelemetryEntry("CRITICAL", "SHAKE EVENT DETECTED", "--", "Decoy");
          triggerCallInstantly();
        }
      }
      lastX = x;
      lastY = y;
      lastZ = z;
    }
  });

  // Desktop keyboard simulator trigger ('S' key) for presentation demonstration
  window.addEventListener('keydown', (event) => {
    if (!window.appState.shakeActive) return;
    
    // Ignore keys if user is typing in input fields
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return;
    }
    
    if (event.key === 'S' || event.key === 's') {
      // Prevent double trigger if decoy screen is already visible
      if (screenOverlay.classList.contains('active')) return;

      logTelemetryEntry("CRITICAL", "SIMULATED SHAKE EVENT", "--", "Decoy");
      triggerCallInstantly();
    }
  });
}

function startFakeCallRing() {
  // Uses Web Audio API to create a mock telephone ring
  try {
    if (!fakeCallAudioCtx) {
      fakeCallAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const playRingTone = () => {
      const now = fakeCallAudioCtx.currentTime;
      
      const osc1 = fakeCallAudioCtx.createOscillator();
      const osc2 = fakeCallAudioCtx.createOscillator();
      const gainNode = fakeCallAudioCtx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      // Standard North American ringback tones: 440Hz + 480Hz
      osc1.frequency.value = 440;
      osc2.frequency.value = 480;

      gainNode.gain.setValueAtTime(0, now);
      // Ring pulse: fade in, ring for 1.8 seconds, fade out
      gainNode.gain.linearRampToValueAtTime(0.12, now + 0.1);
      gainNode.gain.setValueAtTime(0.12, now + 1.8);
      gainNode.gain.linearRampToValueAtTime(0, now + 2.0);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(fakeCallAudioCtx.destination);

      osc1.start();
      osc2.start();

      osc1.stop(now + 2.0);
      osc2.stop(now + 2.0);
    };

    playRingTone();
    fakeCallAudioInterval = setInterval(playRingTone, 3500); // repeat every 3.5s
  } catch (e) {
    console.warn("Fake Call Ring audio failed: ", e);
  }
}

function stopFakeCallRing() {
  if (fakeCallAudioInterval) {
    clearInterval(fakeCallAudioInterval);
    fakeCallAudioInterval = null;
  }
}

/* ==========================================================================
   5. AUDIO RECORDING VAULT
   ========================================================================== */
function initAudioVault() {
  const triggerBtn = document.getElementById('trigger-record');
  const recorderWidget = document.getElementById('widget-recorder');
  const recordStatus = document.getElementById('record-status-text');
  const icon = recorderWidget.querySelector('.action-icon');

  triggerBtn.addEventListener('click', () => {
    if (!window.appState.recordingActive) {
      // Start recording
      window.appState.recordingActive = true;
      icon.classList.add('recording');
      recordStatus.textContent = "RECORDING LIVE";
      recordStatus.style.color = "var(--color-crimson)";
      logTelemetryEntry("Audio", "Microphone Vault Armed", "--", "Rec...");
    } else {
      // Stop recording
      window.appState.recordingActive = false;
      icon.classList.remove('recording');
      recordStatus.textContent = "Audio Saved";
      recordStatus.style.color = "var(--color-emerald)";
      logTelemetryEntry("Audio", "File Encrypted & Uploaded", "--", "Saved");
      
      // Reset back to ready after 3 seconds
      setTimeout(() => {
        if (!window.appState.recordingActive) {
          recordStatus.textContent = "Ready";
          recordStatus.style.color = "";
        }
      }, 3000);
    }
  });
}

/* ==========================================================================
   6. TELEMETRY LOG PIPELINE
   ========================================================================== */
function initTelemetryLog() {
  // Generate first entry
  logTelemetryEntry("Uplink", "Sync Established", "0 km/h", "98%");
  
  // Periodic update log simulator (every 5 seconds)
  setInterval(() => {
    if (!window.appState.telemetryStreaming) return;
    
    // Diminish battery slowly
    if (Math.random() > 0.8 && window.appState.currentBattery > 1) {
      window.appState.currentBattery--;
      document.getElementById('metric-battery').textContent = `${window.appState.currentBattery}%`;
      
      // Update battery icon state
      const batteryIcon = document.getElementById('icon-battery');
      if (window.appState.currentBattery <= 20) {
        batteryIcon.setAttribute('data-lucide', 'battery-warning');
        batteryIcon.style.color = 'var(--color-crimson)';
      } else if (window.appState.currentBattery <= 50) {
        batteryIcon.setAttribute('data-lucide', 'battery-medium');
        batteryIcon.style.color = 'var(--color-amber)';
      }
      lucide.createIcons();
    }

    // Toggle simulated signal fluctuation
    const signals = ['Strong (5G)', 'Strong (LTE)', 'Moderate (4G)', 'Weak (3G)'];
    if (Math.random() > 0.7) {
      const randomSignal = signals[Math.floor(Math.random() * signals.length)];
      window.appState.signalStrength = randomSignal;
      document.getElementById('metric-signal').textContent = randomSignal;
      
      const signalIcon = document.getElementById('icon-signal');
      if (randomSignal.includes('Weak')) {
        signalIcon.style.color = 'var(--color-amber)';
      } else {
        signalIcon.style.color = '';
      }
    }

    // If SOS active, increase frequency of telemetry updates (handled inside SOS module)
    if (window.appState.sosActive) {
      logTelemetryEntry("ALERT", `${window.appState.currentLat.toFixed(6)}, ${window.appState.currentLng.toFixed(6)}`, `${window.appState.speed} km/h`, "SOS!");
    } else if (window.appState.speed > 0) {
      logTelemetryEntry("Track", `${window.appState.currentLat.toFixed(6)}, ${window.appState.currentLng.toFixed(6)}`, `${window.appState.speed} km/h`, `${window.appState.currentBattery}%`);
    }
  }, 5000);
}

function logTelemetryEntry(type, coords, speed, battery) {
  const container = document.getElementById('telemetry-entries');
  if (!container) return;

  const now = new Date();
  const timestamp = now.toTimeString().split(' ')[0]; // HH:MM:SS

  // Queue telemetry if it represents positional tracking and we are offline
  let isOfflineData = false;
  if (!window.appState.isOnline && (type === 'Track' || type === 'ALERT' || type === 'CRITICAL')) {
    // Add to offline queue
    const logItem = { timestamp, type, coords, speed, battery };
    window.appState.offlineQueue.push(logItem);
    localStorage.setItem('shakthi_telemetry_queue', JSON.stringify(window.appState.offlineQueue));
    isOfflineData = true;
    
    // Update connectivity UI counter
    if (typeof window.updateConnectivityUI === 'function') {
      window.updateConnectivityUI();
    }
  }

  const entry = document.createElement('div');
  entry.className = `log-row log-entry`;
  if (type === 'CRITICAL' || type === 'ALERT') {
    entry.classList.add('sos-alert-log');
  }
  
  if (isOfflineData) {
    entry.classList.add('offline-log-entry');
  }

  // Format coordinates cleanly if it's a number pair
  let coordsHTML = `<span class="log-coordinate">${coords}</span>`;
  
  let syncStatusText = battery;
  if (isOfflineData) {
    syncStatusText = "QUEUED";
  }

  entry.innerHTML = `
    <span>${timestamp}</span>
    ${coordsHTML}
    <span>${speed}</span>
    <span style="${isOfflineData ? 'color: var(--color-amber); font-weight: bold;' : ''}">${syncStatusText}</span>
  `;

  // Prepend to show latest at top
  container.insertBefore(entry, container.firstChild);

  // Keep log size clean (max 30 entries)
  if (container.children.length > 30) {
    container.removeChild(container.lastChild);
  }
}

// Expose logging to map routing engine
window.logTelemetryFromMap = logTelemetryEntry;

/* ==========================================================================
   7. EMERGENCY CONTACTS EDITOR
   ========================================================================== */
function initContactsEditor() {
  const editBtn = document.getElementById('edit-contacts-btn');
  const modalOverlay = document.getElementById('contact-editor-modal');
  const closeBtn = document.getElementById('close-editor');
  const saveBtn = document.getElementById('save-contacts');

  // Input elements
  const inputPName = document.getElementById('edit-p-name');
  const inputPPhone = document.getElementById('edit-p-phone');
  const inputSName = document.getElementById('edit-s-name');
  const inputSPhone = document.getElementById('edit-s-phone');

  // Display elements
  const displayPName = document.getElementById('contact-p-name');
  const displayPPhone = document.getElementById('contact-p-phone');
  const displaySName = document.getElementById('contact-s-name');
  const displaySPhone = document.getElementById('contact-s-phone');

  editBtn.addEventListener('click', () => {
    // Sync current values to inputs
    inputPName.value = displayPName.textContent;
    inputPPhone.value = displayPPhone.textContent;
    inputSName.value = displaySName.textContent;
    inputSPhone.value = displaySPhone.textContent;

    modalOverlay.classList.add('show');
  });

  closeBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('show');
  });

  saveBtn.addEventListener('click', () => {
    // Update main layout text
    displayPName.textContent = inputPName.value;
    displayPPhone.textContent = inputPPhone.value;
    displaySName.textContent = inputSName.value;
    displaySPhone.textContent = inputSPhone.value;

    // Update clickable links
    displayPName.parentElement.nextElementSibling.setAttribute('href', `tel:${inputPPhone.value.replace(/\s+/g, '')}`);
    displaySName.parentElement.nextElementSibling.setAttribute('href', `tel:${inputSPhone.value.replace(/\s+/g, '')}`);

    modalOverlay.classList.remove('show');
    logTelemetryEntry("Contacts", "Guardian Info Updated", "--", "--");
  });
}

/* ==========================================================================
   8. OFFLINE-FIRST CONNECTIVITY MONITOR & BUFFER QUEUE
   ========================================================================== */
function initConnectivityMonitor() {
  const updateStatus = () => {
    const isOnline = navigator.onLine;
    window.appState.isOnline = isOnline;
    
    const container = document.getElementById('connection-status');
    const textEl = document.getElementById('connection-text');
    
    if (!container || !textEl) return;
    
    if (isOnline) {
      container.className = "connectivity-status online";
      container.setAttribute('title', 'Telemetry synced with cloud server');
      
      const queueCount = window.appState.offlineQueue.length;
      if (queueCount > 0) {
        textEl.textContent = `Sync: Recovering (${queueCount} items)...`;
        // Flush queue in background
        flushOfflineQueue();
      } else {
        textEl.textContent = "Sync: Connected";
      }
      // Set normal cloud icon
      container.innerHTML = `<i data-lucide="cloud"></i><span id="connection-text">${textEl.textContent}</span>`;
    } else {
      container.className = "connectivity-status offline";
      container.setAttribute('title', 'Device offline (Dead Zone). Buffering data locally.');
      
      const queueCount = window.appState.offlineQueue.length;
      textEl.textContent = `Offline (${queueCount} queued)`;
      // Set cloud-off icon (strike-through cloud)
      container.innerHTML = `<i data-lucide="cloud-off"></i><span id="connection-text">${textEl.textContent}</span>`;
    }
    
    // Refresh Lucide icons in container
    lucide.createIcons();
  };
  
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  
  // Expose updates to other scripts
  window.updateConnectivityUI = updateStatus;
  
  // Initial check
  updateStatus();
}

function flushOfflineQueue() {
  if (window.appState.offlineQueue.length === 0) return;
  
  const itemsToSync = [...window.appState.offlineQueue];
  const count = itemsToSync.length;
  
  logTelemetryEntry("Uplink", `Syncing ${count} buffered entries...`, "--", "Syncing");
  
  // Simulate sync delay
  setTimeout(() => {
    // Clear queue
    window.appState.offlineQueue = [];
    localStorage.removeItem('shakthi_telemetry_queue');
    
    // Update UI
    if (typeof window.updateConnectivityUI === 'function') {
      window.updateConnectivityUI();
    }
    
    logTelemetryEntry("Uplink", `Sync Completed! ${count} items flushed`, "--", "Online");
  }, 1500);
}

/* ==========================================================================
   9. SAFE ARRIVAL VERIFICATION & CHECK-IN
   ========================================================================== */
let verificationCountdownInterval = null;

function initArrivalVerification() {
  const verificationBar = document.getElementById('arrival-verification');
  const timerEl = document.getElementById('verification-timer');
  const safeTriggerBtn = document.getElementById('im-safe-trigger');
  
  if (!safeTriggerBtn) return;
  
  safeTriggerBtn.addEventListener('click', () => {
    // User checked in safe!
    clearInterval(verificationCountdownInterval);
    verificationCountdownInterval = null;
    if (verificationBar) verificationBar.style.display = 'none';
    
    const transitStatusText = document.getElementById('transit-status');
    const transitETAText = document.getElementById('transit-eta');
    if (transitStatusText) transitStatusText.textContent = 'Arrived safely at destination!';
    if (transitETAText) transitETAText.textContent = '0 mins remaining';
    
    // Log safe arrival
    logTelemetryEntry("Arrived", "Checked in Safe (Manual)", "0 km/h", `${window.appState.currentBattery}%`);
  });
  
  window.triggerArrivalVerification = (endCoords) => {
    // Show verification prompt
    if (verificationBar) verificationBar.style.display = 'flex';
    
    let timeRemaining = 10; // 10 seconds for demo convenience
    if (timerEl) timerEl.textContent = `${timeRemaining}s`;
    
    logTelemetryEntry("Arrival Check", "Verification countdown initialized (10s)", "--", "--");
    
    clearInterval(verificationCountdownInterval);
    verificationCountdownInterval = setInterval(() => {
      timeRemaining--;
      if (timerEl) timerEl.textContent = `${timeRemaining}s`;
      
      if (timeRemaining <= 0) {
        clearInterval(verificationCountdownInterval);
        verificationCountdownInterval = null;
        if (verificationBar) verificationBar.style.display = 'none';
        
        // User failed to check in (Incapacitated scenario!)
        logTelemetryEntry("CRITICAL", "NO ARRIVAL CHECK-IN RECEIVED (INCAPACITATED)", "0 km/h", "ALERT");
        
        // Trigger SOS emergency broadcast immediately!
        if (typeof window.activateEmergencyBroadcast === 'function') {
          window.activateEmergencyBroadcast();
        } else {
          const sosTrigger = document.getElementById('sos-trigger');
          if (sosTrigger) sosTrigger.click();
        }
      }
    }, 1000);
  };
}

/* ==========================================================================
   10. COMMUNITY HAZARD REPORTING (CROWDSOURCING)
   ========================================================================== */
function initHazardReporting() {
  const triggerBtn = document.getElementById('report-hazard-trigger');
  const modalOverlay = document.getElementById('hazard-report-modal');
  const closeBtn = document.getElementById('close-hazard');
  const hazardOptions = document.querySelectorAll('.hazard-opt');

  if (!triggerBtn || !modalOverlay) return;

  // Show selection overlay
  triggerBtn.addEventListener('click', () => {
    modalOverlay.classList.add('show');
  });

  // Hide selection overlay
  closeBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('show');
  });

  // Handle hazard choice clicks
  hazardOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type');
      const lat = window.appState.currentLat;
      const lng = window.appState.currentLng;

      // Anonymously spawn hazard warning indicators on Map
      if (window.mapModule && typeof window.mapModule.addCommunityHazard === 'function') {
        window.mapModule.addCommunityHazard(lat, lng, type);
      }

      // Live update Zone Safety rating index
      // Drops safety index from initial 90% down to 52%, updating gauge rings and warnings
      if (window.mapModule && typeof window.mapModule.updateSafetyAssessmentScore === 'function') {
        window.mapModule.updateSafetyAssessmentScore(52, "Local Hazard Reported", `Anonymized community report of ${type} nearby.`);
      }

      // Log in Telemetry Uplink feed
      logTelemetryEntry("Community", `Anon: ${type} reported nearby`, "--", "Alert");

      // Close modal
      modalOverlay.classList.remove('show');
    });
  });
}
