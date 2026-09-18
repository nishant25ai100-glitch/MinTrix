#!/usr/bin/env python3
"""
OreSight — MOIL Manganese Reserve & Production Intelligence Dashboard
Model Training Pipeline

Trains and saves 3 scikit-learn models:
1. Reserve Estimation Model (GradientBoostingRegressor)
2. Production Shortfall Forecasting Model (GradientBoostingRegressor with lag features)
3. Shortfall Risk Classifier (RandomForestClassifier)

Extracts genuine feature importances to power UI explainability.
Saves serialized model artifacts and metadata in /ml/models.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error, classification_report, accuracy_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def train_reserve_model():
    print("-" * 60)
    print("1. Training Reserve Estimation Model (GradientBoostingRegressor)...")
    reserves_csv = os.path.join(DATA_DIR, "reserve_exploration.csv")
    df = pd.read_csv(reserves_csv)
    
    feature_cols = [
        "ore_grade_pct",
        "depth_m",
        "rock_hardness_mohs",
        "drill_hole_density",
        "gravity_anomaly_mgal",
        "spectral_band_ratio",
        "ndvi_anomaly",
        "soil_moisture_pct",
        "surface_temp_c",
        "magnetic_susceptibility",
    ]
    target_col = "estimated_reserve_tonnes"
    
    X = df[feature_cols]
    y = df[target_col]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = GradientBoostingRegressor(
        n_estimators=160,
        learning_rate=0.07,
        max_depth=4,
        subsample=0.85,
        random_state=42
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
    
    print(f"   Train samples: {len(X_train)} | Test samples: {len(X_test)}")
    print(f"   R² Score: {r2:.4f} | MAE: {mae:,.1f} tonnes | RMSE: {rmse:,.1f} tonnes | MAPE: {mape:.2f}%")
    
    # Feature importances
    importances = dict(zip(feature_cols, [round(float(val), 4) for val in model.feature_importances_]))
    sorted_importances = dict(sorted(importances.items(), key=lambda item: item[1], reverse=True))
    print(f"   Top Contributing Features: {sorted_importances}")
    
    # Save model and meta
    model_path = os.path.join(MODELS_DIR, "reserve_estimator.pkl")
    joblib.dump(model, model_path)
    
    meta = {
        "model_name": "Reserve Estimation Regressor",
        "algorithm": "GradientBoostingRegressor (scikit-learn)",
        "r2_score": round(r2, 4),
        "mae": round(mae, 1),
        "rmse": round(rmse, 1),
        "mape_pct": round(mape, 2),
        "feature_cols": feature_cols,
        "feature_importances": sorted_importances,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
    }
    return meta

def train_production_forecast_model():
    print("-" * 60)
    print("2. Training Production Forecast Model (GradientBoostingRegressor)...")
    daily_csv = os.path.join(DATA_DIR, "daily_production_equipment.csv")
    df = pd.read_csv(daily_csv)
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values(by=["site_id", "date"]).reset_index(drop=True)
    
    # Engineer rolling and lag features per site
    df["rolling_7d_actual"] = df.groupby("site_id")["actual_tonnes"].transform(lambda s: s.shift(1).rolling(7, min_periods=1).mean())
    df["rolling_14d_downtime"] = df.groupby("site_id")["total_downtime_hours"].transform(lambda s: s.shift(1).rolling(14, min_periods=1).mean())
    df["lag_1_actual"] = df.groupby("site_id")["actual_tonnes"].shift(1)
    df["lag_7_actual"] = df.groupby("site_id")["actual_tonnes"].shift(7)
    
    # Fill initial NaNs with first available values
    df = df.bfill()
    
    feature_cols = [
        "target_tonnes",
        "total_downtime_hours",
        "excavator_downtime_hours",
        "drill_downtime_hours",
        "dumper_downtime_hours",
        "fleet_utilization_pct",
        "rainfall_mm",
        "soil_moisture_pct",
        "surface_temp_c",
        "blasting_delay_hours",
        "weather_stoppage_hours",
        "labor_attendance_pct",
        "rolling_7d_actual",
        "rolling_14d_downtime",
        "lag_1_actual",
        "lag_7_actual",
    ]
    target_col = "actual_tonnes"
    
    X = df[feature_cols]
    y = df[target_col]
    
    # 80/20 train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = GradientBoostingRegressor(
        n_estimators=180,
        learning_rate=0.06,
        max_depth=5,
        subsample=0.85,
        random_state=42
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100
    
    print(f"   Train samples: {len(X_train)} | Test samples: {len(X_test)}")
    print(f"   R² Score: {r2:.4f} | MAE: {mae:,.1f} tonnes | RMSE: {rmse:,.1f} tonnes | MAPE: {mape:.2f}%")
    
    importances = dict(zip(feature_cols, [round(float(val), 4) for val in model.feature_importances_]))
    sorted_importances = dict(sorted(importances.items(), key=lambda item: item[1], reverse=True))
    print(f"   Top Contributing Features: {sorted_importances}")
    
    model_path = os.path.join(MODELS_DIR, "production_forecaster.pkl")
    joblib.dump(model, model_path)
    
    meta = {
        "model_name": "Production Shortfall Forecaster",
        "algorithm": "GradientBoostingRegressor with Lag/Rolling Features (scikit-learn)",
        "r2_score": round(r2, 4),
        "mae": round(mae, 1),
        "rmse": round(rmse, 1),
        "mape_pct": round(mape, 2),
        "feature_cols": feature_cols,
        "feature_importances": sorted_importances,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
    }
    return meta

def train_risk_classifier_model():
    print("-" * 60)
    print("3. Training Shortfall Risk Classifier (RandomForestClassifier)...")
    daily_csv = os.path.join(DATA_DIR, "daily_production_equipment.csv")
    df = pd.read_csv(daily_csv)
    
    feature_cols = [
        "target_tonnes",
        "total_downtime_hours",
        "excavator_downtime_hours",
        "drill_downtime_hours",
        "dumper_downtime_hours",
        "fleet_utilization_pct",
        "rainfall_mm",
        "soil_moisture_pct",
        "surface_temp_c",
        "weather_stoppage_hours",
        "blasting_delay_hours",
        "labor_attendance_pct",
    ]
    target_col = "shortfall_risk_tier"
    
    X = df[feature_cols]
    y = df[target_col]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=8,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)
    
    print(f"   Train samples: {len(X_train)} | Test samples: {len(X_test)}")
    print(f"   Accuracy: {acc*100:.2f}% | Macro F1-Score: {report['macro avg']['f1-score']:.4f}")
    
    importances = dict(zip(feature_cols, [round(float(val), 4) for val in model.feature_importances_]))
    sorted_importances = dict(sorted(importances.items(), key=lambda item: item[1], reverse=True))
    print(f"   Top Contributing Features: {sorted_importances}")
    
    model_path = os.path.join(MODELS_DIR, "risk_classifier.pkl")
    joblib.dump(model, model_path)
    
    meta = {
        "model_name": "Shortfall Risk Tier Classifier",
        "algorithm": "RandomForestClassifier with Balanced Weights (scikit-learn)",
        "accuracy": round(acc, 4),
        "macro_f1": round(report["macro avg"]["f1-score"], 4),
        "classes": list(model.classes_),
        "feature_cols": feature_cols,
        "feature_importances": sorted_importances,
        "classification_report": report,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
    }
    return meta

def main():
    print("=" * 70)
    print("OreSight ML Model Training Pipeline")
    print("=" * 70)
    
    reserve_meta = train_reserve_model()
    forecast_meta = train_production_forecast_model()
    risk_meta = train_risk_classifier_model()
    
    # Save combined model registry
    registry = {
        "reserve_model": reserve_meta,
        "forecast_model": forecast_meta,
        "risk_model": risk_meta,
    }
    reg_path = os.path.join(MODELS_DIR, "model_registry.json")
    with open(reg_path, "w") as f:
        json.dump(registry, f, indent=2)
        
    print("\n" + "=" * 70)
    print(f"✓ All models trained, serialized, and saved to {MODELS_DIR}")
    print(f"✓ Registry metadata saved to {reg_path}")
    print("=" * 70)

if __name__ == "__main__":
    main()
