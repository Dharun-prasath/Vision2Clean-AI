# ♻️ Vision2Clean AI

A robust real-time AI system leveraging CCTV and mobile video streams to detect, classify, and estimate waste in public areas using deep learning, with geospatial mapping for smart waste management.

---

## 🌍 Project Overview

**Vision2Clean AI** is a solution for the subject **"Waste to Wealth to Wheels"**.  
It utilizes **YOLOv11** and advanced computer vision to:

- Detect and classify waste types in real-time from mobile/CCTV feeds
- Estimate waste quantity via bounding box analysis
- Tag detections with static GPS coordinates (pre-mapped per camera)
- Visualize results on a live interactive map

---

## 🎯 Key Features

- 🧠 YOLOv11-powered multi-category waste detection
- 🗂️ Supports detection of Plastic, Organic, Paper, Metal, E-waste, and more
- 🛰️ Location tagging using static GPS data
- 🗺️ Interactive map visualization with **Folium**
- 💾 Data logging to CSV and SQLite database
- 📲 Mobile phone camera integration for live feeds
- 📊 Dashboard for analytics (React.js)

---

## 🔧 Tech Stack

| Component        | Technology/Library         |
|------------------|---------------------------|
| Detection Model  | YOLOv11 (Ultralytics)     |
| Video Streaming  | IP Webcam App / OpenCV    |
| Mapping          | Folium (Python)           |
| Data Storage     | CSV / SQLite              |
| Dashboard        | React.js                  |

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/vision2clean-ai.git
cd vision2clean-ai
```

### 2. Install Dependencies

```bash
# Python dependencies
pip install -r requirements.txt

# For dashboard (React.js)
cd dashboard
npm install
```

### 3. Configure Camera & GPS

- Set up IP Webcam App or connect CCTV feed.
- Update camera GPS coordinates in `config/cameras.json`.

### 4. Run the Application

```bash
# Start detection and mapping
python main.py

# Start dashboard (in dashboard directory)
npm start
```

---

## 📁 Repository Structure

```
vision2clean-ai/
├── config/
│   └── cameras.json
├── data/
│   └── detections.csv
├── dashboard/
├── main.py
├── requirements.txt
└── README.md
```

---

## 📢 Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements.

---

## 📄 License

This project is licensed under the MIT License.

