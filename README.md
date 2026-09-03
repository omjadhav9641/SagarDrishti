# SAGAR DRISHTI — AI-Powered Maritime Oil Spill Detection & Vessel Attribution System

> **SEE. TRACE. ATTRIBUTE.**  
> *A state-of-the-art maritime environmental intelligence platform leveraging satellite SAR imagery, 2D hydrodynamic drift physics, and AIS vessel telemetry to detect marine oil slicks, reconstruct probable origin zones, and identify responsible candidate vessels.*

---

## 🌊 Executive Overview

Marine oil spills cause catastrophic, long-lasting ecological damage to coastal ecosystems, marine life, and maritime livelihoods. However, attributing responsibility for illegal or accidental oil discharges at sea is historically challenging due to ocean current transport, wind leeway, and non-cooperative vessel behavior.

**SAGAR DRISHTI** solves this problem by providing an end-to-end intelligence pipeline that connects satellite acquisition directly to actionable vessel evidence audit reports:
1. **Detects Oil Slicks**: Processes Sentinel-1 SAR C-Band satellite imagery using computer vision and deep semantic segmentation algorithms to extract slick geometry, surface area, and backscatter attenuation metrics.
2. **Reconstructs Drift History**: Performs backward hydrodynamic advection modeling (hindcasting) combining wind leeway factor (3.5%) and ocean surface currents to isolate the **Probable Origin Zone** with boundary-constrained coastal clipping.
3. **Correlates AIS Telemetry**: Filters historical AIS telemetry feeds using spatial-temporal funneling, flags behavioral anomalies (slowdowns, transmission gaps, course changes), and computes explainable correlation scores (0–100) for candidate vessels.
4. **Generates Official PDF Reports**: Compiles investigation leads, evidence audit checklists, and chronological timelines into downloadable, high-resolution PDF and CSV reports.

---

## 🛠️ Key Features

- **Satellite SAR Detection Engine**: Automated dark-region segmentation, speckle noise reduction (GaussianBlur/Otsu), contour extraction, compactness calculation, and base64 mask generation.
- **Ocean Drift Reconstruction Physics**:
  - **Hindcast Model**: Reconstructs historical oil slick transport backwards in time ($T - 2.5\text{h}$) to pinpoint the origin zone.
  - **Forecast Model**: Predicts future slick advection ($+6\text{h}, +12\text{h}, +24\text{h}$) for emergency response planning.
  - **Maritime Boundary Constraint**: Constrains all drift trajectories to open water, preventing physical invalidity across coastal landmasses.
- **AIS Anomaly & Multi-Factor Correlation**:
  - Evaluates spatial distance to origin, temporal presence during release window, trajectory alignment, speed drops, and AIS telemetry transmission gaps.
  - Generates explainable evidence breakdown scores and priority ratings (**HIGH**, **MEDIUM**, **LOW**).
- **Interactive Geospatial Dashboard**:
  - Built with Leaflet & React, rendering crisp OpenStreetMap light basemaps, interactive layer toggles, popup evidence cards, and timeline progression controls.
- **Enterprise Reporting Suite**:
  - Dynamically builds downloadable PDF reports embedded with official logo artwork using native ReportLab flowables.
  - Provides CSV export for raw evidence lead integration into maritime authority workflows.

---

## 📐 System Architecture

```
                                +-----------------------------------+
                                |      Sentinel-1 SAR Imagery       |
                                +-----------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                       SAGAR DRISHTI PLATFORM                                      |
|                                                                                                   |
|  +--------------------------------+   +-------------------------------+   +--------------------+  |
|  |     Satellite CV / ML Module   |   |   Hydrodynamic Drift Model    |   | AIS Telemetry Core |  |
|  | Dark Backscatter Segmentation  |   | Reverse Advection (Hindcast)  |   | Funnel Filtering   |  |
|  | Area, Centroid & Mask Compute  |   | Forward Advection (Forecast)  |   | Anomaly Detection  |  |
|  +--------------------------------+   +-------------------------------+   +--------------------+  |
|                                  \                |                  /                            |
|                                   v               v                 v                             |
|                                +--------------------------------------+                           |
|                                |     Vessel Correlation Engine        |                           |
|                                | Multi-Factor Weighted Scoring (0-100)|                           |
|                                +--------------------------------------+                           |
|                                                   |                                               |
+---------------------------------------------------|-----------------------------------------------+
                                                    v
                                +---------------------------------------+
                                |  FastAPI Backend (ReportLab Engine)   |
                                +---------------------------------------+
                                        /                       \
                                       v                         v
                       +-----------------------+     +-----------------------+
                       | Interactive Dashboard |     |  PDF / CSV Evidence   |
                       |  (React + Leaflet)    |     |  Investigation Report |
                       +-----------------------+     +-----------------------+
```

---

## 🚀 Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Leaflet (`react-leaflet`), Lucide React icons.
- **Backend API**: Python 3.10+, FastAPI, Uvicorn, Pydantic, HTTPX.
- **Computer Vision & Physics**: OpenCV (`cv2`), NumPy, Shapely / Custom Geospatial Math (`haversine`, `move_point`).
- **Reporting**: ReportLab (Native PDF Flowable Canvas), CSV generator.
- **Testing**: Pytest, FastAPI TestClient.

---

## ⚙️ Installation & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Git**

### 1. Repository Setup
```bash
git clone https://github.com/omjadhav9641/SagarDrishti.git
cd SagarDrishti
```

### 2. Backend Setup (FastAPI)
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

# Install Python dependencies
pip install fastapi uvicorn reportlab opencv-python-headless numpy pydantic httpx pytest

# Start backend server (Runs on http://127.0.0.1:8005)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8005
```

### 3. Frontend Setup (React + Vite)
Open a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server (Runs on http://localhost:3000)
npm run dev -- --port 3000
```

Open `http://localhost:3000` in your web browser to launch the platform.

---

## 🧪 Testing Backend PDF Generator

To verify PDF report generation, embedded logo artwork, and HTTP response headers:
```bash
cd backend
python tests/test_pdf_report.py
```
Expected output:
```text
PASS: test_pdf_report_endpoint (PDF signature, embedded image artwork, and clean formatting verified!)
PASS: test_csv_report_endpoint
ALL BACKEND PDF/CSV TESTS PASSED SUCCESSFULLY!
```

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns backend module operational status & system heartbeat |
| `GET` | `/api/demo` | Serves complete end-to-end SD-001 incident scenario |
| `POST` | `/api/detect-spill` | Upload SAR image to extract oil slick contour mask & metrics |
| `POST` | `/api/drift/backcast` | Runs reverse advection to calculate probable origin coordinates |
| `POST` | `/api/vessels/rank` | Reweights candidate vessel correlation scores dynamically |
| `GET` | `/api/report/pdf` | Generates & serves downloadable investigation PDF report (`SD-001.pdf`) |
| `GET` | `/api/report/csv` | Serves vessel evidence leads as downloadable CSV file |

---

## ⚖️ Legal Disclaimer

> **Non-Attribution Notice**: Correlation scores, anomaly indicators, and vessel rankings generated by Sagar Drishti represent investigative prioritization metrics based on spatial-temporal telemetry analysis. They do not constitute legal proof of liability or judicial attribution of fault.

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
