# TechFusion SafeSphere

## The Idea
**SafeSphere** is an intelligent, premium personal safety dashboard designed to address the challenges women face during transit and nighttime travel. While traditional apps focus only on reactive panic buttons, SafeSphere provides a proactive safety net. It combines glassmorphic emergency controls, real-time location telemetry streams, and a motion-driven routing engine that maps safe paths, identifies safe havens (security desks, libraries, entrances), and dynamically calculates route safety indices.

---

## Important Links
* 🟢 **Live Deployment Link**: [https://koushik2024-code.github.io/TechFusion-v2v/](https://koushik2024-code.github.io/TechFusion-v2v/)  
  *(See deployment instructions below to make this live in 10 seconds)*
* 🎥 **Demo Video Link**: [Insert Google Drive / YouTube Video Link here]

---

## Features
* **Feature 1: Interactive, glassmorphic safety tracking widgets**
  * *SOS Countdown Trigger*: A press-and-hold circular SOS button with a 3-second visual countdown to prevent accidental activation.
  * *Web Audio Alarm Siren*: A programmatically synthesized dual-tone siren alarm (sweeping frequencies) that can be activated to draw immediate physical attention.
  * *Fake Call Simulator & Shake Trigger*: An overlay simulating a realistic incoming phone call screen (avatar vibration, accept/decline triggers) to help users escape uncomfortable situations. Can be triggered instantly, or physically activated by shaking the device (enabled via toggle switch). Features a built-in keyboard shortcut (`S` key) to simulate shake on desktop setups.
  * *Audio Vault*: Visual micro-action simulating ambient audio capture with an animated sine-wave visualizer canvas that pulses when recording is active.
  * *Voice Guardian*: An interactive voice-activated SOS trigger using Web Speech API that listens for safety keywords (`help`, `sos`, `emergency`) to start the countdown. It also listens for `stop` or `cancel` during the countdown or an active emergency to stop the alarm and turn the listening loop OFF permanently.
  * *Stealth Mode Toggle*: A header-level toggle button that instantly transitions the entire layout into a pitch-black theme, grayscaling the map, hiding bright gradient background blobs, and lowering layout contrast to keep the user hidden in dark environments.
  * *Emergency Contacts Manager*: In-app editor overlay to customize primary and secondary guardian details. Features a quick-access WhatsApp integration to instantly **Connect with SHE Team** (+91 63048 54034) with pre-filled distress messages.
* **Feature 2: Real-time passive location telemetry**
  * *Device Status Panel*: Interactive cards display signal strength, telemetry streaming status, and battery percentage (which drains slightly over time). Features a real-time glowing canvas line chart showing tracking speed and latency with a dynamic text readout (`TELEMETRY: XX KM/H`) and an integrated "Simulate Low" battery trigger.
  * *Low Battery Standby Protocol*: Active battery monitoring that triggers automatically when device charge hits <15%. It instantly transmits final known coordinate telemetry to primary contacts and logs safety alerts before putting the UI in a dimmed, low-power state.
  * *System Event Log (Audit Trail)*: A tabbed terminal log card showing a chronological, color-coded audit trail of all system actions (device initialization, voice command matches, alert disarms, decoy triggers, battery warnings) for judge diagnostics.
  * *Telemetry Uplink Log*: A scrolling terminal feed showing active timestamps, coordinate streams (centered around CBIT Hyderabad campus paths), walking speed, and battery health.
* **Feature 3: Responsive, motion-driven transit routing map**
  * *Dark Matter Theme*: Minimalist Leaflet.js base map using CartoDB Dark Matter tiles to fit the premium dark UI theme.
  - *Safe Havens & Caution Zones*: Pinpoints CCTV hubs, patrol checkpoints, and active guard posts (green) alongside caution zones like unlit corridors or construction zones (pulsing red circles).
  - *Safe Transit Simulation*: Draws a path avoiding caution circles and animates the user's avatar moving from the Hostels to the Library, dynamically updating the HUD progress bar, remaining time, and segment safety descriptions.
* **Feature 4: About & Regional Impact Page & Dynamic View Switching**
  - *Sleek Page Swapping Tab Navigation*: Quick-access header navigation buttons that let the user swap view layers dynamically between the live Dashboard and the About page, with a smooth, premium slide-up fade-in transition.
  - *Regional Safety Gaps & Statistics Grid*: A detailed, responsive comparison table/grid explaining regional public safety problems (infrastructure dark zones, response lag, and lack of crowdsourced reports) and how SafeSphere tackles them.
  - *Automated Leaflet Layout Recalculation*: Auto-redraw system that triggers map invalidation on return to the Dashboard tab, preventing typical Leaflet gray tile rendering issues after display toggling.
* **Feature 5: Safety & Legal Disclaimer Footer**
  - *Low-Profile Mature Footer Layout*: A dedicated base footer section with a scale icon and clear disclaimer text displaying platform safety boundaries (explaining it's a prototype security assistant and not a replacement for official police emergency channels).

---

## Women-Centric Impact & Intentionality

SafeSphere was designed from the ground up to address specific physical and psychological safety challenges faced by women during transit:
1. **Accident-Proof Panic Controls**: Typical SOS buttons trigger instantly, leading to high rates of false alarms and users disabling them. Our **3-second press-and-hold countdown** ensures intentionality while providing an immediate exit.
2. **De-escalation via Fake Call**: Women frequently encounter uncomfortable, non-emergency situations (unwanted conversations, trailing strangers) where a direct alert is too drastic. The **Fake Call Simulator** provides a socially acceptable, instant excuse to detach and move to safety.
3. **Voice-Activated SOS & Hands-Free Safety**: In high-stress or dangerous situations, physically unlocking a phone is often impossible. The **Voice Guardian** allows users to trigger the SOS sequence hands-free simply by saying trigger words like "Help" or "SOS".
4. **Smart Voice Deactivation (Smart Stop)**: To prevent accidental feedback loops (where the system hears its own alarm or user conversation and re-triggers), Voice Guardian switches off completely once the "Stop" command is spoken, ensuring absolute control.
5. **Proactive Safe Routing**: Rather than just showing the fastest route, the dashboard evaluates pathways based on illumination, CCTV, and proximity to active guards, keeping the traveler informed before they step into a caution zone.
6. **Synthesized Siren for Deterrence**: A high-frequency physical siren acts as an immediate local deterrent, drawing bystander attention and discouraging potential offenders.

---

## UI/UX Design Philosophy
* **High Contrast Dark Aesthetics**: Designed for night-time use to prevent glare and maintain low visibility of the phone screen in dark areas.
* **Double Dot-Matrix Grid Background**: Deep blue-violet mesh background with a double-layered, subtle CSS dot-matrix grid (spacing at `30px` and `60px` with low opacity) and mouse-following spotlight glow.
* **Glassmorphic Depth & Static Layout**: Frosted-glass overlays create clear visual hierarchies without cluttering the screen. Cards remain static and fixed on hover to ensure click targets remain precise under high-stress conditions.
* **Single-Tap Accessibility**: Core emergency triggers (SOS, Siren, Fake Call) are oversized and positioned within easy thumb reach.
* **Micro-Animations**: Beacon rings, pulse indicators, and shaker alerts give immediate visual confirmation of active operations.

---

## Tech Stack & Tools
* **Core Technologies**: Semantic HTML5, Vanilla CSS3 (CSS Variables, Flexbox/Grid, Glassmorphic filters, keyframe animations), Vanilla JavaScript (ES6+).
* **APIs**: Web Speech API (`SpeechRecognition` & `webkitSpeechRecognition`) for voice triggers, Web Audio API for sound synthesis.
* **Mapping**: Leaflet.js & CartoDB Dark Matter Tile Services.
* **Icons & Fonts**: Font Awesome 6 Icons, Lucide Icons, Google Fonts (Outfit & Inter).
* **AI Tools**: **Antigravity AI (Google DeepMind)** utilized for rapid prototype design, HSL theme selection, Web Audio API DSP synthesis logic, and map routing math.

---

## Documentation

### How It Works Under the Hood

#### 1. SOS Coordinator & Alert State
When a user clicks the SOS button, a `setInterval` timer triggers a 3-second countdown. A CSS-driven SVG circle border fills relative to the countdown duration. Clicking "Cancel" clears the intervals and hides the overlay. If it completes, the dashboard enters a critical warning state:
* The status banner turns red with a flashing beacon.
* The Web Audio Siren is triggered.
* A high-priority event is pushed to the Telemetry Log.
* The Map zooms in on the user's location, computes the closest Safe Haven, and draws a red-dotted path directly to it.

#### 2. Web Audio DSP Siren Synthesis
Instead of requesting external MP3 files (which can lag, fail to load, or hit CORS policies), the alarm uses the browser's native Web Audio API. 
* An `AudioContext` initializes a sawtooth oscillator and a sine oscillator connected to a gain node.
* A timer sweeps the frequency between `630Hz` (low pitch) and `980Hz` (high pitch) every 400 milliseconds, producing a realistic, loud warning siren.

#### 3. Transit Routing & Dynamic Safety Indexing
The routing simulation interpolates coordinate points along the selected walkway segments.
* During the animation, a loop calculates the mathematical distance from the user marker to the centroid of each caution zone using the Haversine method (Leaflet's `.distanceTo()` function).
* If the user enters a caution radius, the safety score (Safety Assessment Gauge) dynamically decreases (e.g., from 98% to 68%), changing the gauge outline color from green to yellow/red and warning the user to return to the illuminated path.

#### 4. Offline-First Telemetry Sync & Local Buffering (Dead Zones)
To handle situations where the user enters a cellular "dead zone" (disconnected/no internet access):
* **Real-time Connection Detection**: The application utilizes standard browser connection APIs (`navigator.onLine` and window `online`/`offline` events) to monitor connectivity in real time.
* **Visual Status Indicator**: When offline, the header dynamically updates to display a prominent warning indicator featuring a strike-through Cloud (`cloud-off`) icon and showing the count of queued telemetry records.
* **Local Buffer Queuing**: If a telemetry point is recorded (either regular interval logging or SOS telemetry broadcast) while offline, the system intercepts the event, serializes the telemetry record, and queues it in the browser's `localStorage` (under the key `shakthi_telemetry_queue`). This guarantees data persistence even if the browser is closed, the tab is reloaded, or the device loses power.
* **Local UI Feedback**: Telemetry entries captured offline are styled with a distinct yellow warning indicator and marked as `QUEUED` in the telemetry uplink logs.
* **Auto-Recovery Background Sync**: When connection is restored (triggering the `online` event), a sync manager automatically reads the buffered entries from `localStorage`, batches them, simulates a secure background synchronization to the cloud server, and flushes the queue, returning the indicator status to `Sync: Connected`.

#### 5. Decoy Call & Accelerometer Shake Detection
To allow hands-free panic-escape triggers:
* **Accelerometer Streaming**: The module binds to `devicemotion` events on the browser window to monitor 3D force coordinates (`accelerationIncludingGravity`).
* **iOS/Android Permission Gateway**: As modern mobile browsers restrict motion sensors, enabling "Shake to Trigger" prompts the standard permission prompt modal requiring user consent.
* **Force Speed Analysis**: The engine computes acceleration changes over 100ms intervals. Shaking forces exceeding `18m/s²` immediately trigger the decoy incoming call screen.
* **Presentation Simulator Key**: Pressing the `S` key on a keyboard acts as a simulated shake event, allowing presenters to demonstrate the feature on desktop/laptop setups without physically moving the computer.

#### 6. Incapacitation Safeguard (Arrival Check-in)
To protect a user who may become incapacitated at the end of a route:
* **Check-in Prompt**: Upon arriving at the selected destination coordinate, the transit tracking HUD transitions from regular ETA display to an alert state, prompting the user with a green flashing check-in bar containing an "I'm Safe" button.
* **10-second Verification Countdown**: A local timer initializes a 10-second countdown (representing the customizable check-in buffer).
* **Automatic SOS Escalation**: If the user checks in within 10 seconds, the check-in is complete, the bar closes, and normal status is restored. If the countdown runs out, the system assumes the user is incapacitated, cancels standby mode, and immediately triggers the fullscreen **EMERGENCY ACTIVATED** broadcast overlay and synthesized siren sound to alert nearby citizens and remote guardians.

#### 7. Crowdsourced Safety Alerts & Live Safety Score Recalculation
To build a collaborative community protection network:
* **Anonymized Local Reporting**: Tapping the "Report Local Hazard" button under the Safety Assessment panel opens a selection list containing common hazard types (Broken Streetlights, Suspicious Group, Isolated Area, Road Obstruction).
* **Live Heatmap Integration**: Selecting a hazard queries the user's current coordinate telemetry and calls Leaflet hooks to overlay a new caution marker and a dotted red circular hazard warning zone (representing community-reported danger sectors).
* **Dynamic Safety Assessment score Drop**: The system recalculates the neighborhood safety score, dropping it to a caution level (52%), changing the gauge indicator border to yellow, and updating the status text to recommend alternate routes.
* **Global Telemetry Uplink Logs**: Pushes a crowdsourced alert event (`Community - Anon: Broken Streetlights reported nearby`) to the telemetry feed to notify guardians.

#### 8. Voice Activation Guardian & Smart Feedback Prevention
The Voice Guardian leverages the browser's Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) to parse audio inputs:
* **SOS Activation**: When inactive, listening for keywords like `"help"`, `"sos"`, `"emergency"`, or `"alert"` triggers the 3-second SOS countdown sequence.
* **Smart Stop/Cancel Command**: If either the 3-second countdown is ticking (`sosCountdownActive === true`) or the full emergency state is active (`sosActive === true`), the system intercepts the loop and listens specifically for deactivation commands (`"stop"`, `"cancel"`, `"deactivate"`). Hearing one will immediately cancel/dismiss the alert, silence any audio oscillators, and toggle the Voice Guardian OFF completely, disabling the microphone to stop listening permanently.

#### 9. Real-Time Canvas-Based Visualizers
* **Telemetry Chart**: Renders a scrolling line chart using HTML5 Canvas 2D contexts, showing speed and network latency variations. It handles high-DPI displays via device pixel ratio scaling, automatically renders grid lines, glowing cyan path lines, and overlays a real-time speed text readout (`TELEMETRY: XX KM/H`).
* **Audio Waveform**: Renders three superimposed sine waves with shifted phase values (sine wave animations) to represent audio recording activity.

#### 10. Low-Light Stealth Mode (Visual Blackout)
To protect a user hiding in the dark, the Stealth Mode toggle applies a series of CSS variables and filters on the `body` element:
* **UI Dimming & Contrast**: The layout is darkened to `60%` brightness to limit ambient light emissions.
* **Map Blackout**: Map tiles are grayscaled, inverted, and dimmed via CSS webkit filters, making them render in a low-visibility red/dark theme.
* **Orb Suppression**: The colorful background blur parallax layers (`bg-orb`) are completely hidden.

#### 11. Low Battery Standby Protocol
To manage emergency situations when the phone battery is critical (<15%):
* **Automatic Safeguard Trigger**: Triggers location transmission and switches off high-frequency animations to save power.
* **Emergency Dispatch**: Sends simulated SMS/WhatsApp alerts with the user's final coordinates, preventing guardians from panicking when the device goes offline.
* **Visual Warning Banner**: Alerts the user that Low Battery mode is active via a high-contrast top banner.

#### 12. Chronological System Event Log (Audit Trail)
For absolute transparency and debugging:
* **System Event Capture**: Tracks key milestones (e.g. startup, voice trigger hits, siren toggles, call simulations).
* **Color-Coded Statuses**: Categorized into `SYSTEM`, `SAFETY`, `WARNING`, `CRITICAL`, and `RESOLVED` severity levels.
* **Diagnostics Tab**: Toggleable within the Telemetry Uplink card using a lightweight JS event tab listener.

#### 13. Tab Routing, Transitions & Scroll Resets
To support multiple pages in a clean, single-page application structure:
* **Dynamic Tab Swapping**: Clicking navigation tabs triggers the adding/removing of the `.hidden` class (`display: none !important;`) on `.dashboard-container` and `#about-section`.
* **Sleek Fade-In Transitions**: When switching views, a slide-up fade-in transition (`pageFadeIn` animation) plays to animate the section elements into the viewport.
* **Scroll-to-Top Reset**: Swapping tabs automatically triggers a `window.scrollTo({ top: 0, behavior: 'instant' })` and sets the scrollable containers' `.scrollTop = 0`, ensuring that the new page always displays starting from the top, just like a fresh page load.
* **Leaflet Map Redraw**: When returning to the Dashboard view, the system calls `map.invalidateSize()` after a brief delay. This forces Leaflet to recalculate the map bounds, fixing the rendering canvas.

#### 14. Safety & Legal Disclaimer Footer
To show legal safety responsibility and platform maturity:
* **Professional Legal Notice**: A permanent bottom footer clarifies that SafeSphere is a prototype safety platform, not a replacement for official police emergency dispatch lines, and advises dialling local emergency telephone lines in actual threat scenarios.
* **Responsive Layout Grid**: The footer container adapts to different displays, rendering as a horizontal line on desktop and stacking as a column on mobile to fit the viewport seamlessly.

