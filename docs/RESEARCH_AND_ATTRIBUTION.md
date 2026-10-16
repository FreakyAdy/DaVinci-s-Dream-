# Research & Historical Attribution
## Da Vinci's Dream

### 1. Historical Context: Leonardo da Vinci's Aerodynamic Investigations
Leonardo da Vinci spent decades (notably between 1485 and 1505) studying avian flight, compiling his observations into the celebrated *Codice sul volo degli uccelli* (Codex on the Flight of Birds) and scattered folios within the *Codex Atlanticus*.

#### Key Historical Insights:
- **Observation of Avian Airflow**: Leonardo was among the first in recorded history to note that air offers resistance and exerts upward thrust against an inclined wing, noting: *"An object offers as much resistance to the air as the air does to the object."* (anticipating Newton's third law).
- **Reciprocal Flapping Mechanisms**: His ornithopters relied on articulated wood and cane ribs wrapped in starched linen or bat-like leather membranes, driven by hand cranks and foot stirrups.
- **The Physical Barrier**: Leonardo eventually realized that the human pectoral musculature lacks the power-to-weight ratio needed to sustain direct muscle-powered flapping flight without soaring winds or mechanical assistance. He transitioned later in life to studying gliders.

---

### 2. Modern Speculative Engineering vs. Historical Fact

| Engineering Dimension | Historical Leonardo Design (c. 1505) | Da Vinci's Dream Simulation Engine |
| :--- | :--- | :--- |
| **Power Source** | Human leg stirrups and hand pulleys ($\approx 250$–$400$ W peak output). | Continuous actuator controller simulating human/mechanical hybrid input. |
| **Launch Method** | Elevated cliff or rooftop (e.g. Monte Ceceri, Fiesole). | Elevated cliff platform ($25$ m altitude) with initial glide speed. |
| **Wing Kinematics** | Reciprocal wood-and-pulley flapping with manual pitch control. | Quasi-steady 2D flapping model with dynamic angle of attack and active tail pitch elevator. |
| **Flight Duration** | Several seconds of steep descent or hard crash. | Controllable gliding and powered flapping over 150–220 meters to a target valley. |
| **Intelligent Control** | Human reflex. | Reinforcement Learning (PPO neural network) and classical feedback baseline. |

---

### 3. Open Source Projects & Technologies
- **Gymnasium**: Open-source standard API for reinforcement learning environments (Farama Foundation).
- **Stable-Baselines3**: Reliable reinforcement learning implementations in PyTorch (DLR-RM).
- **FastAPI**: Modern, high-performance web framework for Python APIs (Sebastián Ramírez).
- **Three.js**: Lightweight 3D JavaScript library (Ricardo Cabello / Mr.doob).
- **Lucide Icons**: Clean, consistent icon set.
