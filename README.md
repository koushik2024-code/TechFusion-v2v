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
  * *Fake Call Simulator*: An overlay simulating a realistic incoming phone call screen (avatar vibration, accept/decline triggers) to help users escape uncomfortable situations.
  * *Audio Vault*: Visual micro-action simulating ambient audio capture and secure encryption/upload.
  * *Emergency Contacts Manager*: In-app editor overlay to customize primary and secondary guardian details.
* **Feature 2: Real-time passive location telemetry**
  * *Device Status Panel*: Interactive cards display signal strength, telemetry streaming status, and battery percentage (which drains slightly over time).
  * *Telemetry Uplink Log*: A scrolling terminal feed showing active timestamps, coordinate streams (centered around CBIT Hyderabad campus paths), walking speed, and battery health.
* **Feature 3: Responsive, motion-driven transit routing map**
  * *Dark Matter Theme*: Minimalist Leaflet.js base map using CartoDB Dark Matter tiles to fit the premium dark UI theme.
  * *Safe Havens & Caution Zones*: Pinpoints CCTV hubs, patrol checkpoints, and active guard posts (green) alongside caution zones like unlit corridors or construction zones (pulsing red circles).
  * *Safe Transit Simulation*: Draws a path avoiding caution circles and animates the user's avatar moving from the Hostels to the Library, dynamically updating the HUD progress bar, remaining time, and segment safety descriptions.

---

## Women-Centric Impact & Intentionality

SafeSphere was designed from the ground up to address specific physical and psychological safety challenges faced by women during transit:
1. **Accident-Proof Panic Controls**: Typical SOS buttons trigger instantly, leading to high rates of false alarms and users disabling them. Our **3-second press-and-hold countdown** ensures intentionality while providing an immediate exit.
2. **De-escalation via Fake Call**: Women frequently encounter uncomfortable, non-emergency situations (unwanted conversations, trailing strangers) where a direct alert is too drastic. The **Fake Call Simulator** provides a socially acceptable, instant excuse to detach and move to safety.
3. **Proactive Safe Routing**: Rather than just showing the fastest route, the dashboard evaluates pathways based on illumination, CCTV, and proximity to active guards, keeping the traveler informed before they step into a caution zone.
4. **Synthesized Siren for Deterrence**: A high-frequency physical siren acts as an immediate local deterrent, drawing bystander attention and discouraging potential offenders.

---

## UI/UX Design Philosophy
* **High Contrast Dark Aesthetics**: Designed for night-time use to prevent glare and maintain low visibility of the phone screen in dark areas.
* **Glassmorphic Depth**: Frosted-glass overlays create clear visual hierarchies without cluttering the screen.
* **Single-Tap Accessibility**: Core emergency triggers (SOS, Siren, Fake Call) are oversized and positioned within easy thumb reach.
* **Micro-Animations**: Beacon rings, pulse indicators, and shaker alerts give immediate visual confirmation of active operations.

---

## Tech Stack & Tools
* **Core Technologies**: Semantic HTML5, Vanilla CSS3 (CSS Variables, Flexbox/Grid, Glassmorphic filters, keyframe animations), Vanilla JavaScript (ES6+).
* **Mapping**: Leaflet.js & CartoDB Dark Matter Tile Services.
* **Icons & Fonts**: Lucide Icons, Google Fonts (Outfit & Inter).
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

---

## How to Enable GitHub Pages (Deployment)

To host your live prototype on GitHub Pages for free:
1. Go to your repository on GitHub: `https://github.com/koushik2024-code/TechFusion-v2v`
2. Click on the **Settings** tab.
3. In the left menu, under "Code and automation", click **Pages**.
4. Under "Build and deployment", set **Source** to **Deploy from a branch**.
5. Under **Branch**, select **`main`** and **`/ (root)`**, then click **Save**.
6. Wait 30 seconds, and your live URL `https://koushik2024-code.github.io/TechFusion-v2v/` will be active!
