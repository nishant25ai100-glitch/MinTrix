# OreSight — MOIL Machine Learning Model Card

**Model Family:** OreSight Intelligence Engine v1.0  
**Target Organization:** MOIL Limited (Ministry of Steel, Govt. of India)  
**Problem Statement:** SIH 26009 — Using AI/ML and Space Technology to Identify Manganese Reserves and Overcome Production Shortfalls  

---

## 1. Model Summary & Architectural Overview

OreSight deploys three specialized scikit-learn models trained on geological, satellite telemetry, and operational time-series data:

| Model Identifier | Primary Objective | Algorithm | Test Metric Achieved | Artifact File |
|---|---|---|---|---|
| **Reserve Estimator** | Predict in-situ manganese reserve tonnage per exploration block | `GradientBoostingRegressor` | **\(R^2 = 0.8720\)**, MAE = 115.6k T | `ml/models/reserve_estimator.pkl` |
| **Production Forecaster** | Forecast next-day/period mine output with lag & weather factors | `GradientBoostingRegressor` | **\(R^2 = 0.9815\)**, MAE = 27.2 T | `ml/models/production_forecaster.pkl` |
| **Shortfall Risk Classifier** | Classify probability tier (`Low`, `Medium`, `High`) of missing target | `RandomForestClassifier` | **Accuracy = 73.15%**, F1 = 0.6955 | `ml/models/risk_classifier.pkl` |

---

## 2. Dataset Specifications

### Exploration & Geological Grid (`reserve_exploration.csv`)
- **Total Records:** 500 spatial blocks across 5 MOIL mining zones (Balaghat, Dongri Buzurg, Gumgaon, Mansar, Ukwa).
- **Features (10):** `depth_m`, `ore_grade_pct`, `rock_hardness_mohs`, `drill_hole_density`, `gravity_anomaly_mgal`, `spectral_band_ratio`, `ndvi_anomaly`, `soil_moisture_pct`, `surface_temp_c`, `magnetic_susceptibility`.
- **Target:** `estimated_reserve_tonnes`.
- **Train/Test Split:** 80% Train (400 samples) / 20% Test (100 samples), randomized split (`seed=42`).

### Operational Production & Space-Weather Time Series (`daily_production_equipment.csv`)
- **Total Records:** 5,475 daily observations spanning 3 years (2023-01-01 to 2025-12-31).
- **Features (16):** Target daily output, excavator/dumper/drill downtime hours, total equipment downtime, fleet utilization %, rainfall (mm), soil moisture %, land surface temperature (°C), weather stoppage hours, blasting delay hours, labor attendance %, 7-day rolling actual tonnage, 14-day rolling downtime, lag-1 and lag-7 actual tonnage.
- **Targets:** `actual_tonnes` (Regression) and `shortfall_risk_tier` (`Low`, `Medium`, `High`) (Classification).
- **Train/Test Split:** 80% Train (4,380 samples) / 20% Test (1,095 samples). Stratified split for classification.

---

## 3. Evaluation & Validation Results

### A. Reserve Estimation Model (`reserve_estimator.pkl`)
- **Algorithm:** Gradient Boosting Regressor (160 estimators, learning rate = 0.07, max depth = 4, subsample = 0.85).
- **\(R^2\) Score:** `0.8720` (explains 87.2% of geological variance).
- **Mean Absolute Error (MAE):** `115,677.3 tonnes`.
- **Root Mean Squared Error (RMSE):** `177,479.9 tonnes`.
- **Mean Absolute Percentage Error (MAPE):** `12.76%`.
- **Top Feature Importances:**
  1. `depth_m`: **67.84%**
  2. `ore_grade_pct`: **21.70%**
  3. `gravity_anomaly_mgal`: **2.58%**
  4. `soil_moisture_pct`: **1.68%**
  5. `rock_hardness_mohs`: **1.52%**

### B. Production Shortfall Forecaster (`production_forecaster.pkl`)
- **Algorithm:** Gradient Boosting Regressor with engineered lag and rolling statistics (180 estimators, learning rate = 0.06, max depth = 5).
- **\(R^2\) Score:** `0.9815`.
- **Mean Absolute Error (MAE):** `27.2 tonnes`.
- **RMSE:** `36.3 tonnes`.
- **MAPE:** `4.82%`.
- **Top Feature Importances:**
  1. `target_tonnes`: **49.29%**
  2. `rolling_7d_actual`: **17.40%**
  3. `rainfall_mm`: **10.53%**
  4. `fleet_utilization_pct`: **10.27%**
  5. `weather_stoppage_hours`: **7.31%**
  6. `total_downtime_hours`: **1.96%**

### C. Shortfall Risk Classifier (`risk_classifier.pkl`)
- **Algorithm:** Random Forest Classifier with balanced class weights (150 estimators, max depth = 8, min samples leaf = 2).
- **Accuracy:** `73.15%`.
- **Macro F1-Score:** `0.6955`.
- **Top Feature Importances:**
  1. `total_downtime_hours`: **28.62%**
  2. `fleet_utilization_pct`: **13.08%**
  3. `labor_attendance_pct`: **9.56%**
  4. `dumper_downtime_hours`: **9.12%**
  5. `rainfall_mm`: **8.96%**
  6. `excavator_downtime_hours`: **7.62%**
  7. `soil_moisture_pct`: **7.40%**

---

## 4. UI Explainability Mapping

Every prediction in the OreSight frontend pulls directly from `model.feature_importances_`:
- **Reserve Cards:** Display relative weights of geological depth, assay grade, Bouguer gravity anomaly, and SWIR spectral absorption.
- **Shortfall Cards:** Display operational driver breakdown (Equipment downtime vs. Weather severity vs. Blasting delays vs. Haulage road conditions).
- **Recommendation Engine:** Evaluates which feature contributed the highest loss for a site and maps it to targeted corrective operations (e.g. if `dumper_downtime_hours` > 8h, recommend reallocating secondary haulers from adjacent mines).

---

## 5. Known Limitations & Roadmap for Production

1. **Synthetic Training Baseline:** Data was synthesized using realistic Central Indian geophysical laws (sinusoidal monsoons, Bouguer gravity distributions, MOIL pit telemetry). While relationships are strictly causal, real-world deployment requires ingestion of MOIL drill-core logs and Geological Survey of India (GSI) GIS layers.
2. **Satellite Ingestion Pipeline:** Satellite features (NDVI, soil moisture, land surface temperature) currently represent calibrated synthetic indicators. In production, this pipeline connects to **ISRO Bhuvan Open Data APIs** and Sentinel-2 / Cartosat-3 multispectral imagery feeds.
3. **Advanced Time-Series Modeling:** The prototype utilizes Gradient Boosting with autoregressive lag terms for rapid sub-second inference. For enterprise operations, a hybrid Prophet/LSTM or Temporal Fusion Transformer (TFT) architecture can be swapped in without modifying frontend contracts.
