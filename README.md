# ♻️ Vision2Clean AI

A real-time AI system that uses CCTV video streams to detect, classify, and estimate waste in public areas using deep learning and maps the locations for smart waste management.

---

## 🌍 Project Overview

**Vision2Clean AI** is developed as a project for the subject **"Waste to Wealth to Wheels"**.  
It uses **YOLOv11** and **computer vision** to:

- Detect types of waste in real-time from mobile cameras acting as CCTV
- Estimate the waste quantity using bounding box size
- Tag waste with GPS (pre-mapped for each camera)
- Display detections on a **live interactive map**

---

## 🎯 Features

- 🧠 YOLOv11-based waste detection
- 🗂️ Supports multiple waste categories:
  - Plastic, Organic, Paper, Metal, E-waste, etc.
- 🛰️ Location tagging via static GPS coordinates
- 🗺️ Map visualization using **Folium**
- 💾 Logging to CSV / database
- 📲 Uses mobile phone cameras for live feed

---

## 🔧 Tech Stack

| Component        | Tool/Library           |
|------------------|------------------------|
| Detection Model  | YOLOv11 (Ultralytics)  |
| Live Feed        | IP Webcam App / OpenCV |
| Map View         | Folium (Python)        |
| Data Storage     | CSV / SQLite           |
| Dashboard        | React js               |

---

## ⚙️ Setup Instructions

### 1. Clone the Repo
```bash
git clone https://github.com/yourusername/vision2clean-ai.git
cd vision2clean-ai


