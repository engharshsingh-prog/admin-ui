# Cirrel — Glassy Admin Dashboard 🛒

An ultra-sleek, dark-mode glassmorphic admin dashboard inspired by the Kiln & Leaf e-commerce admin design. Built with vanilla modern web technologies, zero external runtime dependencies, GPU-accelerated CSS animations, and interactive SVG data visualizations.

---

## ✨ Advanced Features & Capabilities

### 1. 🪟 Hyper-Realistic Glassmorphism
- `backdrop-filter: blur(28px) saturate(190%)` frosted glass cards with specular top border highlights (`box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)`).
- **3D Card Parallax Tilt**: Hovering over cards calculates subtle 3D rotational tilt based on cursor coordinates (`perspective: 1000px`, `rotateX`, `rotateY`).
- **Dynamic Specular Spotlight**: Radial light illumination follows the mouse across borders and frosted surfaces (`--mouse-x`, `--mouse-y`).
- **Ambient Glowing Mesh**: Breathing and floating glowing orbs (Golden/Amber sun sphere, Electric Blue, Mint Green, Cyan, and Violet).
- **Film Noise Texture**: Authentic micro-grain glass texture overlay.

### 2. 📊 Multi-View Navigation Panels
Switch seamlessly between full dashboard views using the sidebar or Command Palette:
- **Dashboard**: Hero Sales Studio Catmull-Rom Bezier spline chart, November goal donut gauge, real-time visitor wave equalizer, packing queue, running low inventory, and acquisition channels.
- **Orders & Fulfillment**: Full frosted glass data table with real-time text search, filter tabs (*All 24, Pending 3, Packed 5, Shipped 16*), inline *"Pack Item"* actions, and CSV export.
- **Tea Collection & Inventory**: Visual showcase grid of specialty teas (*Ceremonial Matcha, Milk Oolong, Bergamot Grey, Hojicha, Jasmine Pearls, Chamomile*) with origin labels, tasting notes, and restock actions.
- **Store Analytics & Growth**: 30-day conversion funnel, Average Order Value (AOV) expansion metrics, and global shipping regional breakdown.
- **Customer Directory**: VIP tea connoisseur tiers (*Jade Connoisseur, Gold Member, Tea Master*), lifetime spend tracking, and messaging shortcuts.
- **Preferences & Glass Studio**: Interactive sliders to adjust GPU blur radius (8px - 45px), ambient mesh glow intensity, synthesized sound FX, and simulator settings in real time!

### 3. 🔊 Synthesized Web Audio API Sound Engine
- Zero external audio files required! Generates crisp, low-latency UI pops, chimes, and fulfillment feedback directly via the browser's built-in `AudioContext`.
- One-click mute/unmute button in the top navigation bar.

### 4. 🔴 Live Stream Sales Simulator
- Toggleable live simulator in the header (`Live Stream: ON/PAUSED`).
- Periodically simulates incoming customer purchases with pleasant audio chimes, live toast notifications, real-time revenue increments, and animated wave equalizer surges.

### 5. ⚡ Micro-Interactions & Overlays
- **Command Palette (`⌘K` / `Ctrl+K`)**: Instant search and navigation across pages, products, and quick actions.
- **Quick Create Modal (`+ Create`)**: Shimmering button to add custom orders live into the fulfillment queue.
- **Notifications Dropdown**: Popover bell menu with unread badges and *"Mark all read"* action.
- **Theme Switcher**: Smooth toggle between **Obsidian Glass** (Dark mode) and **Luminous Frost** (Light mode).

---

## 🚀 How to Run and View

### Option 1: Direct in Browser (Zero Setup)
Simply double-click `index.html` or open it in any modern browser (Chrome, Edge, Safari, Firefox).

### Option 2: Using the Built-in Node Server
```bash
# Start the local server
npm start
# or
node server.js
```
Then visit: [http://localhost:3000](http://localhost:3000)

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `⌘K` or `Ctrl+K` | Open Command Palette / Search |
| `⌘B` or `Ctrl+B` | Toggle Sidebar Collapse / Expand |
| `ESC` | Close any open modal or dropdown |
