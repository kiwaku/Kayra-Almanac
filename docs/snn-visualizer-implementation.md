# SNN Visualizer Implementation Summary

## Overview

A real-time spiking neural network (SNN) visualization panel that responds to browser signals (cursor movement, scroll, idle time) and displays the network's activity through dynamic SVG rendering and output blocks.

## Files Created/Modified

### 1. New Component
**File**: `src/components/SNNVisualizer.astro`
- Complete SNN implementation with LIF (Leaky Integrate-and-Fire) neurons
- SVG parsing and rendering
- Browser signal processing
- Real-time visualization updates

### 2. Modified Layout
**File**: `src/layouts/BaseLayout.astro`
- Added import for SNNVisualizer (line 6)
- Included `<SNNVisualizer />` component after InstrumentPanel (line 81)

### 3. Assets
**File**: `public/assets/neural_graph.svg`
- Original SVG diagram (moved from project root)
- Contains 6→8→4 neuron network structure
- Used subset for 3→4→4 architecture

---

## Architecture

### Network Structure (3→4→4)

```
Input Layer (3 neurons)
  ├─ Neuron 0: vx (cursor velocity X) + noise
  ├─ Neuron 1: vy (cursor velocity Y) + noise
  └─ Neuron 2: scrollDelta (normalized scroll) + noise

Hidden Layer (4 neurons)
  ├─ Fully connected from input layer
  ├─ Heterogeneous thresholds: 1.0, 1.15, 1.3, 1.45
  └─ Random excitatory/inhibitory weights

Output Layer (4 neurons)
  ├─ Fully connected from hidden layer
  ├─ Heterogeneous thresholds: 1.2, 1.3, 1.4, 1.5
  └─ Maps to 4 visual output blocks
```

---

## Neuron Positions (Extracted from SVG)

### Input Layer
```javascript
[
  { id: "0_0", x: 1019, y: 467.5 },
  { id: "0_1", x: 1059, y: 467.5 },
  { id: "0_2", x: 1099, y: 467.5 }
]
```

### Hidden Layer
```javascript
[
  { id: "1_0", x: 979, y: 647.5 },
  { id: "1_1", x: 1019, y: 647.5 },
  { id: "1_2", x: 1059, y: 647.5 },
  { id: "1_3", x: 1099, y: 647.5 }
]
```

### Output Layer
```javascript
[
  { id: "2_0", x: 1059, y: 827.5 },
  { id: "2_1", x: 1099, y: 827.5 },
  { id: "2_2", x: 1139, y: 827.5 },
  { id: "2_3", x: 1179, y: 827.5 }
]
```

---

## Weight Matrices (Random Initialization)

Generated once on load, values between -0.5 and 1.5 (biased toward excitatory).

**Example Output (console)**:
```
⚡ SNN Weight Matrices:
Input→Hidden: [
  [0.82, 1.23, -0.15, 0.91],
  [1.05, 0.67, 1.34, 0.42],
  [0.28, -0.23, 1.12, 0.88]
]
Hidden→Output: [
  [1.15, 0.45, 0.92, -0.32],
  [0.78, 1.41, 0.56, 1.08],
  [-0.18, 0.94, 1.22, 0.73],
  [1.03, 0.61, 0.38, 1.29]
]
```

---

## LIF Neuron Parameters

### Input Layer
- Threshold: 0.8–1.0 (heterogeneous)
- Leak: 0.9
- Refractory period: 3 time steps

### Hidden Layer
- Threshold: 1.0–1.45 (heterogeneous)
- Leak: 0.92
- Refractory period: 5 time steps

### Output Layer
- Threshold: 1.2–1.5 (heterogeneous)
- Leak: 0.94
- Refractory period: 6 time steps

---

## Positioning Logic

### Panel Placement
```javascript
function positionSNNPanel() {
  const panel = document.getElementById('snn-visualizer');
  const instrumentPanel = document.getElementById('instrument-panel');

  const rect = instrumentPanel.getBoundingClientRect();

  // Align to instrument panel's left edge
  panel.style.left = `${rect.left}px`;

  // 12px below instrument panel
  panel.style.top = `${rect.bottom + 12}px`;
}
```

**Runs on**:
- Initial load (after 200ms delay)
- Window resize events

**Console output**:
```
📍 SNN Panel Position: { left: 1234, top: 456, alignedTo: 'InstrumentPanel' }
```

---

## Signal Processing

### Input Signals
1. **Cursor Velocity (vx, vy)**
   - Calculated from `mousemove` events
   - Scaled by 0.1 and normalized with `tanh(v/10)`

2. **Scroll Delta**
   - Captured from `scroll` events
   - Decays at 0.95 per frame
   - Normalized with `tanh(scroll/100)`

3. **Random Noise**
   - Added to each input: `(Math.random() - 0.5) * 0.05`
   - Provides spontaneous activity

### Update Loop
- Runs at 60 FPS via `requestAnimationFrame`
- Performance target: <0.5ms per frame
- Warns in console if threshold exceeded

---

## Visualization Features

### 1. Neuron Highlighting
When a neuron spikes:
- Stroke width increases to 3px
- Stroke color: green (#00ff00)
- Fill: semi-transparent green
- Glow effect via `filter: drop-shadow`
- Duration: 100ms

**CSS Class**: `.spiking`

### 2. Path Pulses
When presynaptic neuron spikes:
- Path stroke: green
- Stroke width: 1.5px
- Animated via `stroke-dashoffset`
- Duration: 300ms

**CSS Class**: `.pulsing`

### 3. Output Blocks
4-cell grid below SVG:
- **Active** (green): Neuron spiked within last 100ms
- **Inactive** (dark gray): No recent spike
- Smooth transitions

**CSS Classes**: `.out`, `.out.active`

---

## Responsive Behavior

### Hide on Small Screens
```css
@media (max-width: 900px) {
  #snn-visualizer {
    display: none !important;
  }
}
```

**Rationale**: Panel requires minimum space; hidden below 900px viewport width.

---

## Performance

### Frame Time Target
- **Goal**: <0.5ms per frame
- **Measured**: Logged every 60 frames if exceeded
- **Console Warning**: `⚠️ SNN update took X.XXms (target: <0.5ms)`

### Optimization Techniques
1. Pre-computed neuron-to-circle mapping
2. Minimal DOM queries per frame
3. CSS transitions for animations (GPU-accelerated)
4. Simple weight matrix lookups (no complex math)

---

## Console Debug Output

### On Initialization
```
🧠 SNN Neuron Positions Extracted:
Input layer: [...]
Hidden layer: [...]
Output layer: [...]

⚡ SNN Weight Matrices:
Input→Hidden: [...]
Hidden→Output: [...]

📍 SNN Panel Position: { left: ..., top: ..., alignedTo: 'InstrumentPanel' }
```

---

## Implementation Notes

1. **No External Libraries**: Pure vanilla JS/TypeScript
2. **Client-Side Only**: No server calls or training
3. **SVG Parsing**: Direct DOM parsing via `DOMParser`
4. **Fixed Architecture**: 3→4→4 network (subset of 6→8→4 SVG)
5. **Reactive Dynamics**: Pure LIF equations, no learning/plasticity

---

## Future Enhancements (Optional)

- Add lateral inhibition in hidden layer
- Implement spike-timing-dependent plasticity (STDP)
- Visualize membrane potentials with color gradients
- Add adjustable parameters via UI controls
- Log spike rates to analyze network dynamics

---

## Testing Checklist

- ✅ SVG loads and displays correctly
- ✅ Panel positions under InstrumentPanel
- ✅ Panel repositions on window resize
- ✅ Neurons spike in response to cursor movement
- ✅ Neurons spike in response to scrolling
- ✅ Output blocks update correctly
- ✅ Visual highlights appear on spikes
- ✅ Panel hidden on screens <900px
- ✅ Performance <0.5ms per frame
- ✅ Console debug output present

---

**Implementation Complete** ✅
