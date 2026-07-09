/* ==========================================================================
   SHAKTHI SAFESPHERE - MAP & ROUTING ENGINE (TechFusion Team)
   ========================================================================== */

window.mapModule = (function() {
  let map = null;
  let userMarker = null;
  let emergencyCircle = null;
  let emergencyPath = null;
  let activePolyline = null;
  
  // Animation variables
  let routeCoordinates = [];
  let currentRouteStepIndex = 0;
  let animationInterval = null;
  
  // Custom Icon Makers (Using Lucide vector classes wrapped in Leaflet DivIcons)
  const createUserIcon = () => L.divIcon({
    html: '<div class="marker-pin user"><i data-lucide="user"></i></div>',
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  const createSafeIcon = () => L.divIcon({
    html: '<div class="marker-pin safe"><i data-lucide="shield"></i></div>',
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  const createCautionIcon = () => L.divIcon({
    html: '<div class="marker-pin caution"><i data-lucide="alert-triangle"></i></div>',
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  // CBIT Campus Coordinates
  const locations = {
    girlsHostel: [17.390800, 78.323500],
    adminJunction: [17.391400, 78.324200],
    adminBlock: [17.392683, 78.325565],
    sportsGround: [17.391000, 78.325200],
    library: [17.391745, 78.326260],
    mainGate: [17.391307, 78.329240],
    dimAlley: [17.392400, 78.323000],
    constructionSite: [17.390300, 78.326500]
  };

  // Safe Havens List
  const safeHavens = [
    { name: "CBIT Girls Hostel Guard Desk", coords: locations.girlsHostel, desc: "24/7 Active Security Post & Emergency Alarm Hub" },
    { name: "CBIT Administration Block Guard", coords: [17.392500, 78.325300], desc: "CCTV Control Room & Campus Security HQ" },
    { name: "CBIT Library Entrance Safe Desk", coords: locations.library, desc: "Lit interior, guards active till 8:00 PM" },
    { name: "CBIT Main Entrance Gate Desk", coords: locations.mainGate, desc: "Round-the-clock patrol team & vehicle checkpoint" }
  ];

  // Caution Areas List
  const cautionAreas = [
    { name: "Dimly Lit Pathway (North)", coords: locations.dimAlley, desc: "Low lighting corridor. Patrol frequency: Low.", radius: 60 },
    { name: "Academic Zone construction site", coords: locations.constructionSite, desc: "Construction debris, blind corners, isolated after 5:30 PM.", radius: 80 }
  ];

  // 1. Initialize Map
  function init() {
    // Center at CBIT Campus Center
    map = L.map('map', {
      zoomControl: false // Custom controls look cleaner
    }).setView([17.3916, 78.3255], 17);

    // Apply CartoDB Dark Matter tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Position Zoom control to bottom right
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    // Add Safe Haven Markers
    safeHavens.forEach(haven => {
      const marker = L.marker(haven.coords, { icon: createSafeIcon() }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif;">
          <h4 style="color: var(--color-emerald); font-weight:700; margin-bottom:4px;">🛡️ ${haven.name}</h4>
          <p style="font-size:0.75rem; color:var(--text-secondary);">${haven.desc}</p>
          <span style="font-size:0.65rem; color:var(--color-cyan); font-weight:600;">STATUS: SECURE</span>
        </div>
      `);
    });

    // Add Caution Area Markers & Visual Red Circles
    cautionAreas.forEach(area => {
      // Icon
      const marker = L.marker(area.coords, { icon: createCautionIcon() }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif;">
          <h4 style="color: var(--color-crimson); font-weight:700; margin-bottom:4px;">⚠️ ${area.name}</h4>
          <p style="font-size:0.75rem; color:var(--text-secondary);">${area.desc}</p>
          <span style="font-size:0.65rem; color:var(--color-crimson); font-weight:600;">ADVISORY: AVOID AFTER DUSK</span>
        </div>
      `);

      // Visual warning circle
      L.circle(area.coords, {
        color: 'var(--color-crimson)',
        fillColor: 'var(--color-crimson)',
        fillOpacity: 0.1,
        weight: 1,
        dashArray: '5, 5',
        radius: area.radius
      }).addTo(map);
    });

    // Add User Avatar Marker (Starting at Hostels)
    userMarker = L.marker(locations.girlsHostel, { icon: createUserIcon() }).addTo(map);
    userMarker.bindPopup(`
      <div style="font-family: 'Inter', sans-serif;">
        <h4 style="color: var(--color-cyan); font-weight:700; margin-bottom:2px;">User (TechFusion)</h4>
        <p style="font-size:0.75rem; color:var(--text-secondary);">Last synced: Just now</p>
      </div>
    `);

    // Setup Safe Routing Buttons
    document.getElementById('find-route').addEventListener('click', startTransitSimulation);
    
    // Refresh Lucide on dynamic elements
    lucide.createIcons();
  }

  // 2. SOS MAP ACTIONS
  function triggerEmergencyOnMap() {
    if (!map || !userMarker) return;

    const userCoords = userMarker.getLatLng();

    // Visual red beacon surrounding user
    if (emergencyCircle) map.removeLayer(emergencyCircle);
    emergencyCircle = L.circle(userCoords, {
      color: 'var(--color-crimson)',
      fillColor: 'var(--color-crimson)',
      fillOpacity: 0.25,
      weight: 2,
      radius: 45
    }).addTo(map);

    // Make beacon pulse by toggling radius slightly (mock animation)
    let shrink = false;
    window.emergencyPulseInterval = setInterval(() => {
      if (emergencyCircle) {
        let r = emergencyCircle.getRadius();
        if (shrink) {
          emergencyCircle.setRadius(45);
        } else {
          emergencyCircle.setRadius(55);
        }
        shrink = !shrink;
      }
    }, 600);

    // Locate closest Safe Haven
    let closestHaven = safeHavens[0];
    let minDistance = Infinity;

    safeHavens.forEach(haven => {
      let d = userCoords.distanceTo(L.latLng(haven.coords));
      if (d < minDistance) {
        minDistance = d;
        closestHaven = haven;
      }
    });

    // Draw emergency beacon path to closest haven
    if (emergencyPath) map.removeLayer(emergencyPath);
    emergencyPath = L.polyline([userCoords, closestHaven.coords], {
      color: 'var(--color-crimson)',
      weight: 4,
      dashArray: '8, 8',
      opacity: 0.8
    }).addTo(map);

    // Pan map to fit both
    const bounds = L.latLngBounds([userCoords, closestHaven.coords]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }

  function clearEmergencyOnMap() {
    if (window.emergencyPulseInterval) {
      clearInterval(window.emergencyPulseInterval);
      window.emergencyPulseInterval = null;
    }
    if (emergencyCircle) {
      map.removeLayer(emergencyCircle);
      emergencyCircle = null;
    }
    if (emergencyPath) {
      map.removeLayer(emergencyPath);
      emergencyPath = null;
    }
    // Re-center on user
    if (map && userMarker) {
      map.setView(userMarker.getLatLng(), 17);
    }
  }

  // 3. TRANSIT SIMULATOR (Path animation & safety scoring)
  function startTransitSimulation() {
    const destinationName = document.getElementById('route-destination').value.trim();
    if (!destinationName) return;

    // Reset existing animation
    if (animationInterval) {
      clearInterval(animationInterval);
    }
    if (activePolyline) {
      map.removeLayer(activePolyline);
    }

    // Determine target coordinates (we fallback to Library if search does not match)
    let startCoords = locations.girlsHostel;
    let endCoords = locations.library;
    let pathLabel = "Girls Hostel to Main Library";

    if (destinationName.toLowerCase().includes("gate") || destinationName.toLowerCase().includes("security")) {
      endCoords = locations.mainGate;
      pathLabel = "Girls Hostel to Main Gate";
      // Route coords towards main gate
      routeCoordinates = interpolatePoints([
        locations.girlsHostel,
        locations.adminJunction,
        locations.sportsGround,
        locations.library,
        [17.391500, 78.327800],
        locations.mainGate
      ], 15);
    } else {
      // Route coords towards library (default)
      routeCoordinates = interpolatePoints([
        locations.girlsHostel,
        locations.adminJunction,
        locations.sportsGround,
        locations.library
      ], 15);
    }

    // Draw Route Polyline
    activePolyline = L.polyline(routeCoordinates, {
      color: 'var(--color-cyan)',
      weight: 4,
      opacity: 0.8,
      dashArray: '1, 8',
      lineCap: 'round'
    }).addTo(map);

    // Zoom map to fit path
    map.fitBounds(activePolyline.getBounds(), { padding: [40, 40] });

    // Reset progress HUD
    currentRouteStepIndex = 0;
    const progressFill = document.getElementById('transit-progress-fill');
    const avatarIndicator = document.getElementById('transit-avatar-indicator');
    const transitStatusText = document.getElementById('transit-status');
    const transitETAText = document.getElementById('transit-eta');
    
    progressFill.style.width = '0%';
    avatarIndicator.style.left = '0%';
    transitStatusText.textContent = `Safe Routing: Starting route...`;

    // Start simulation ticks (every 1 second user moves along interpolated array)
    const totalSteps = routeCoordinates.length;
    window.appState.speed = 4.5; // Average walking speed (km/h)

    animationInterval = setInterval(() => {
      if (currentRouteStepIndex >= totalSteps) {
        // Destination Reached
        clearInterval(animationInterval);
        animationInterval = null;
        window.appState.speed = 0;
        
        transitStatusText.textContent = `Arrived safely at destination!`;
        transitETAText.textContent = `0 mins remaining`;
        progressFill.style.width = '100%';
        avatarIndicator.style.left = '100%';
        
        updateSafetyAssessmentScore(100, "Destination Reached", "Inside verified safe zone. Guard active.");
        window.logTelemetryFromMap("Arrived", `${endCoords[0].toFixed(6)}, ${endCoords[1].toFixed(6)}`, "0 km/h", `${window.appState.currentBattery}%`);
        return;
      }

      // Update User Position
      const nextPos = routeCoordinates[currentRouteStepIndex];
      window.appState.currentLat = nextPos[0];
      window.appState.currentLng = nextPos[1];
      userMarker.setLatLng(nextPos);

      // Compute visual progress percentage
      const percent = (currentRouteStepIndex / (totalSteps - 1)) * 100;
      progressFill.style.width = `${percent}%`;
      avatarIndicator.style.left = `${percent}%`;

      // Update status string based on segment position
      let stepName = "Departed Girls Hostel";
      let details = "Well lit, active security.";
      let scoreVal = 95;

      const segmentFraction = currentRouteStepIndex / totalSteps;
      if (segmentFraction < 0.25) {
        stepName = "Departing Girls Hostel";
        details = "Heading northeast on illuminated path. Guard Desk nearby.";
        scoreVal = 95;
      } else if (segmentFraction < 0.6) {
        stepName = "Passing Admissions Junction";
        details = "Campus center. Well lit, CCTV covered zone.";
        scoreVal = 98;
      } else if (segmentFraction < 0.85) {
        stepName = "Turning near Sports Ground";
        details = "Open area. Approaching library plaza.";
        scoreVal = 88; // Slightly open, but safe path
      } else {
        stepName = "Approaching CBIT Library Plaza";
        details = "High illumination, verified safe haven close by.";
        scoreVal = 96;
      }

      // Dynamic safety deduction if user runs close to construction site/dim areas
      cautionAreas.forEach(area => {
        let userLatLng = L.latLng(nextPos);
        let dist = userLatLng.distanceTo(L.latLng(area.coords));
        if (dist < area.radius + 20) {
          // deduction based on proximity
          scoreVal = Math.min(scoreVal, Math.round(50 + (dist / (area.radius + 20)) * 30));
          stepName = `Caution: Near ${area.name}`;
          details = "Low lighting warning. Stay on the central path.";
        }
      });

      // Update safety gauge visual component
      updateSafetyAssessmentScore(scoreVal, stepName, details);

      // Estimate remaining duration (e.g. 5 minutes total, countdown)
      const remainingSeconds = Math.round((totalSteps - currentRouteStepIndex) * 1.5);
      const remainingMins = Math.ceil(remainingSeconds / 60);
      transitStatusText.textContent = stepName;
      transitETAText.textContent = `${remainingMins} min${remainingMins > 1 ? 's' : ''} remaining`;

      // Telemetry log entry
      if (currentRouteStepIndex % 3 === 0) {
        window.logTelemetryFromMap("Track", `${nextPos[0].toFixed(6)}, ${nextPos[1].toFixed(6)}`, `${window.appState.speed} km/h`, `${window.appState.currentBattery}%`);
      }

      currentRouteStepIndex++;
    }, 1000);
  }

  // Interpolates segments of polyline points to make the marker move smooth
  function interpolatePoints(coordsList, segmentSteps) {
    let result = [];
    for (let i = 0; i < coordsList.length - 1; i++) {
      let start = coordsList[i];
      let end = coordsList[i + 1];
      for (let j = 0; j < segmentSteps; j++) {
        let fraction = j / segmentSteps;
        let lat = start[0] + (end[0] - start[0]) * fraction;
        let lng = start[1] + (end[1] - start[1]) * fraction;
        result.push([lat, lng]);
      }
    }
    result.push(coordsList[coordsList.length - 1]);
    return result;
  }

  // Updates Safety Score Indicator & SVG Ring gauge
  function updateSafetyAssessmentScore(score, stepName, description) {
    const safetyValEl = document.getElementById('safety-score-value');
    const safetyBadge = document.getElementById('safety-score-badge');
    const safetyDesc = document.getElementById('safety-score-desc');
    const gaugeFill = document.getElementById('safety-gauge-fill');

    safetyValEl.textContent = `${score}%`;
    safetyDesc.textContent = description;

    // Set safety status badges based on range
    if (score >= 85) {
      safetyBadge.className = "score-badge safe";
      safetyBadge.textContent = "High Safety Zone";
    } else if (score >= 60) {
      safetyBadge.className = "score-badge warning";
      safetyBadge.textContent = "Caution Advised";
    } else {
      safetyBadge.className = "score-badge danger";
      safetyBadge.textContent = "Unsafe Pathway Alert";
    }

    // Total stroke-dasharray circumfrance is 125.6 (half circle arc)
    // 0% safety = 125.6 offset (empty), 100% safety = 0 offset (full)
    if (gaugeFill) {
      const totalCirc = 125.6;
      const offsetVal = totalCirc - (totalCirc * (score / 100));
      gaugeFill.style.strokeDashoffset = offsetVal;
    }
  }

  // Initializer window hook
  return {
    init: init,
    triggerEmergencyOnMap: triggerEmergencyOnMap,
    clearEmergencyOnMap: clearEmergencyOnMap
  };
})();

// Initialize map on document load
document.addEventListener('DOMContentLoaded', () => {
  window.mapModule.init();
});
