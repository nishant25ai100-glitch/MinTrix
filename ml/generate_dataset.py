#!/usr/bin/env python3
"""
OreSight — MOIL Manganese Reserve & Production Intelligence Dashboard
Synthetic Dataset Generator

Generates realistic time-series and spatial exploration datasets for 5 MOIL mine sites:
1. Balaghat (MP) - Underground, high grade
2. Dongri Buzurg / Bhandara (MH) - Opencast, dioxide ore
3. Gumgaon (MH) - Underground
4. Mansar / Nagpur (MH) - Opencast & Underground
5. Ukwa (MP) - Underground, low-phosphorus ore

Bakes in explicit causal dependencies between satellite/environmental/equipment
features and production shortfalls/reserve estimates.
"""

import os
import math
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)

MINE_SITES = [
    {
        "site_id": "balaghat",
        "name": "Balaghat Mine",
        "state": "Madhya Pradesh",
        "district": "Balaghat",
        "lat": 21.8048,
        "lon": 80.1849,
        "mine_type": "Underground",
        "avg_grade_pct": 46.5,
        "base_target_tpd": 1250,
        "historical_reserve_mt": 18.4,
        "depth_range_m": (180, 420),
        "excavator_count": 6,
        "dumper_count": 18,
        "drill_rig_count": 4,
    },
    {
        "site_id": "dongri_buzurg",
        "name": "Dongri Buzurg Mine",
        "state": "Maharashtra",
        "district": "Bhandara",
        "lat": 21.5540,
        "lon": 79.6917,
        "mine_type": "Opencast",
        "avg_grade_pct": 41.2,
        "base_target_tpd": 1050,
        "historical_reserve_mt": 12.8,
        "depth_range_m": (40, 160),
        "excavator_count": 5,
        "dumper_count": 15,
        "drill_rig_count": 3,
    },
    {
        "site_id": "gumgaon",
        "name": "Gumgaon Mine",
        "state": "Maharashtra",
        "district": "Nagpur",
        "lat": 21.3917,
        "lon": 79.0028,
        "mine_type": "Underground",
        "avg_grade_pct": 39.8,
        "base_target_tpd": 680,
        "historical_reserve_mt": 7.6,
        "depth_range_m": (120, 310),
        "excavator_count": 3,
        "dumper_count": 10,
        "drill_rig_count": 2,
    },
    {
        "site_id": "mansar",
        "name": "Mansar Mine",
        "state": "Maharashtra",
        "district": "Nagpur",
        "lat": 21.4011,
        "lon": 79.2572,
        "mine_type": "Mixed Opencast/Underground",
        "avg_grade_pct": 38.5,
        "base_target_tpd": 760,
        "historical_reserve_mt": 8.9,
        "depth_range_m": (60, 240),
        "excavator_count": 4,
        "dumper_count": 12,
        "drill_rig_count": 3,
    },
    {
        "site_id": "ukwa",
        "name": "Ukwa Mine",
        "state": "Madhya Pradesh",
        "district": "Balaghat",
        "lat": 21.9667,
        "lon": 80.4667,
        "mine_type": "Underground",
        "avg_grade_pct": 43.8,
        "base_target_tpd": 580,
        "historical_reserve_mt": 6.2,
        "depth_range_m": (100, 280),
        "excavator_count": 3,
        "dumper_count": 8,
        "drill_rig_count": 2,
    },
]

def generate_mine_sites_df():
    """Generates mine metadata."""
    df = pd.DataFrame(MINE_SITES)
    return df

def generate_reserve_exploration_dataset(num_samples=500, seed=42):
    """
    Generates geological assay + satellite exploration records across exploration blocks.
    Causally computes estimated_reserve_tonnes from geological + space indicators.
    """
    np.random.seed(seed)
    records = []
    
    for i in range(num_samples):
        site = MINE_SITES[i % len(MINE_SITES)]
        block_id = f"{site['site_id'][:3].upper()}-BLK-{(i // len(MINE_SITES)) + 1:03d}"
        
        # Jitter coordinates around the mine center (~5-12 km radius)
        lat = site["lat"] + np.random.normal(0, 0.04)
        lon = site["lon"] + np.random.normal(0, 0.04)
        
        depth_m = np.random.uniform(site["depth_range_m"][0], site["depth_range_m"][1])
        ore_grade_pct = np.clip(np.random.normal(site["avg_grade_pct"], 2.8), 28.0, 52.0)
        rock_hardness_mohs = np.random.uniform(4.5, 7.2)
        drill_hole_density = np.clip(np.random.normal(12.0, 3.5), 3.0, 24.0) # holes / km2
        
        # Space-tech / satellite indicators
        # Manganese outcrops & mineralized soils often suppress vegetation canopy (negative NDVI anomaly)
        ndvi_anomaly = np.clip(np.random.normal(-0.15, 0.12) - (ore_grade_pct - 35) * 0.006, -0.45, 0.30)
        soil_moisture_pct = np.clip(np.random.normal(24.0, 6.0), 8.0, 48.0)
        surface_temp_c = np.clip(np.random.normal(32.0, 4.5), 20.0, 48.0)
        
        # SWIR (Shortwave Infrared) absorption index for Mn oxides / manganite
        spectral_band_ratio = np.clip(np.random.normal(2.1, 0.45) + (ore_grade_pct / 30.0) * 0.4, 1.1, 4.0)
        
        # Bouguer Gravity Anomaly (mGal) - manganese minerals (pyrolusite, psilomelane) are high-density
        gravity_anomaly_mgal = np.clip(np.random.normal(8.5, 3.0) + (ore_grade_pct - 35) * 0.35, 1.0, 22.0)
        
        # Magnetic susceptibility index (10^-3 SI)
        magnetic_susceptibility = np.clip(np.random.normal(3.5, 1.2), 0.8, 8.5)
        
        # Causal Ground-Truth Formula for estimated reserve tonnage:
        # High ore grade + deep thickness/density + strong gravity anomaly + SWIR spectral signal + negative NDVI anomaly
        base_factor = site["historical_reserve_mt"] * 100_000 # scaling factor
        
        grade_contribution = (ore_grade_pct / 40.0) ** 1.8
        gravity_contribution = (gravity_anomaly_mgal / 8.0) * 120_000
        spectral_contribution = (spectral_band_ratio / 2.0) * 85_000
        vegetation_stress_boost = max(0, -ndvi_anomaly) * 140_000
        density_contribution = (drill_hole_density / 10.0) * 60_000
        depth_factor = math.sqrt(depth_m / 100.0)
        
        noise = np.random.normal(0, 40_000)
        
        estimated_reserve_tonnes = int(
            (base_factor * 0.35 * grade_contribution * depth_factor)
            + gravity_contribution
            + spectral_contribution
            + vegetation_stress_boost
            + density_contribution
            + noise
        )
        estimated_reserve_tonnes = max(80_000, estimated_reserve_tonnes)
        
        # Confidence score % (higher density of drill holes + clear spectral readings => higher confidence)
        confidence_pct = round(np.clip(55.0 + (drill_hole_density * 1.8) + (gravity_anomaly_mgal * 0.8) - abs(noise)/2000, 60.0, 96.5), 1)
        
        records.append({
            "block_id": block_id,
            "site_id": site["site_id"],
            "site_name": site["name"],
            "lat": round(lat, 5),
            "lon": round(lon, 5),
            "depth_m": round(depth_m, 1),
            "ore_grade_pct": round(ore_grade_pct, 2),
            "rock_hardness_mohs": round(rock_hardness_mohs, 2),
            "drill_hole_density": round(drill_hole_density, 2),
            "ndvi_anomaly": round(ndvi_anomaly, 4),
            "soil_moisture_pct": round(soil_moisture_pct, 2),
            "surface_temp_c": round(surface_temp_c, 2),
            "spectral_band_ratio": round(spectral_band_ratio, 3),
            "gravity_anomaly_mgal": round(gravity_anomaly_mgal, 2),
            "magnetic_susceptibility": round(magnetic_susceptibility, 2),
            "confidence_pct": confidence_pct,
            "estimated_reserve_tonnes": estimated_reserve_tonnes,
        })
        
    return pd.DataFrame(records)

def generate_daily_production_dataset(start_date="2023-01-01", days=1095, seed=101):
    """
    Generates 3 years of daily production, equipment telemetry, weather, and satellite time-series.
    Includes deterministic causal formulas linking downtime, rain, and delays to production output.
    """
    np.random.seed(seed)
    start = datetime.strptime(start_date, "%Y-%m-%d")
    all_rows = []
    
    for site in MINE_SITES:
        is_opencast = "Opencast" in site["mine_type"]
        base_target = site["base_target_tpd"]
        
        # Track cumulative equipment state and rolling trends
        for d in range(days):
            current_date = start + timedelta(days=d)
            doy = current_date.timetuple().tm_yday
            month = current_date.month
            
            # --- Space & Weather Indicators (Seasonal sinusoidal + stochastic spikes) ---
            # Central India monsoon: June (month 6) to September (month 9), peak in July/August
            monsoon_phase = math.sin((doy - 140) / 365.0 * 2 * math.pi)
            is_monsoon = 6 <= month <= 9
            
            if is_monsoon:
                rain_prob = 0.55
                rainfall_mm = np.random.exponential(24.0) if np.random.rand() < rain_prob else np.random.uniform(0, 5)
            else:
                rain_prob = 0.08
                rainfall_mm = np.random.exponential(6.0) if np.random.rand() < rain_prob else 0.0
            rainfall_mm = round(min(145.0, rainfall_mm), 1)
            
            # Soil moisture % (heavily tracks rainfall and monsoon season)
            base_moisture = 16.0 + 22.0 * max(0, monsoon_phase)
            soil_moisture_pct = round(np.clip(base_moisture + (rainfall_mm * 0.28) + np.random.normal(0, 2.5), 9.0, 58.0), 1)
            
            # Land Surface Temperature (LST °C) - Peak summer April-May (38-46°C), cooler in winter
            lst_seasonal = 31.0 + 8.5 * math.sin((doy - 60) / 365.0 * 2 * math.pi)
            surface_temp_c = round(np.clip(lst_seasonal - (rainfall_mm * 0.12) + np.random.normal(0, 1.8), 16.0, 48.5), 1)
            
            # NDVI (Vegetation index): Lowest in dry May (~0.22), highest post-monsoon Oct (~0.68)
            ndvi_seasonal = 0.42 + 0.22 * math.sin((doy - 210) / 365.0 * 2 * math.pi)
            ndvi = round(np.clip(ndvi_seasonal + np.random.normal(0, 0.04), 0.18, 0.76), 3)
            
            # --- Operational Disruption Events ---
            # Blasting delays (hours): Higher in opencast and during heavy rain or seismic checks
            if is_opencast:
                blasting_delay_prob = 0.22 if rainfall_mm > 15 else 0.10
                blasting_delay_hours = round(np.random.exponential(1.8) if np.random.rand() < blasting_delay_prob else 0.0, 1)
            else:
                blasting_delay_prob = 0.14
                blasting_delay_hours = round(np.random.exponential(1.2) if np.random.rand() < blasting_delay_prob else 0.0, 1)
            blasting_delay_hours = min(6.0, blasting_delay_hours)
            
            # Weather stoppage hours: Directly caused by torrential rain
            weather_stoppage_hours = 0.0
            if rainfall_mm > 25.0:
                weather_stoppage_hours = round(min(12.0, (rainfall_mm - 20.0) * 0.16 + np.random.uniform(0.5, 2.5)), 1)
                
            # Labor attendance % (slight festival dips in Oct-Nov, otherwise high)
            labor_attendance_pct = round(np.clip(np.random.normal(92.5, 3.8), 74.0, 99.0), 1)
            
            # --- Equipment Telematics & Downtime ---
            # Total equipment units
            tot_machines = site["excavator_count"] + site["dumper_count"] + site["drill_rig_count"]
            
            # Mechanical breakdown probability and severity
            breakdown_prob = 0.16
            has_breakdown = np.random.rand() < breakdown_prob
            
            # Excavator downtime hours (key bottleneck)
            excavator_downtime = np.random.uniform(0.2, 1.5)
            if has_breakdown:
                excavator_downtime += np.random.exponential(5.0)
            if rainfall_mm > 35 and is_opencast:
                excavator_downtime += np.random.uniform(2.0, 6.0) # pit waterlogging
            excavator_downtime = round(min(24.0 * site["excavator_count"] * 0.6, excavator_downtime), 1)
            
            # Drill rig downtime hours
            drill_downtime = round(np.random.uniform(0.2, 2.0) + (np.random.exponential(3.0) if np.random.rand() < 0.12 else 0), 1)
            
            # Dumper fleet downtime hours
            dumper_downtime = round(np.random.uniform(1.0, 4.5) + (np.random.exponential(6.0) if has_breakdown else 0), 1)
            
            total_equipment_downtime_hours = round(excavator_downtime + drill_downtime + dumper_downtime, 1)
            
            # Fleet utilization %
            max_available_hours = tot_machines * 24.0
            fleet_utilization_pct = round(np.clip(100.0 * (1.0 - (total_equipment_downtime_hours / (max_available_hours * 0.45))), 35.0, 98.0), 1)
            
            # --- Target & Actual Production (Causal Formulation) ---
            # Target output fluctuates slightly by monthly plan
            monthly_plan_mult = 1.0 + 0.08 * math.sin((month - 1) / 12.0 * 2 * math.pi)
            target_output = int(base_target * monthly_plan_mult + np.random.normal(0, base_target * 0.02))
            
            # Causal Loss Drivers (Explicitly defined formulas):
            # 1. Equipment downtime loss: Each downtime hour loses ~16-24 tonnes
            downtime_tonnes_loss = total_equipment_downtime_hours * (base_target / 55.0)
            
            # 2. Weather stoppage / severe rain loss:
            weather_tonnes_loss = (weather_stoppage_hours * (base_target / 18.0)) + (max(0, rainfall_mm - 30) * 3.8)
            
            # 3. Soil moisture / ground slip loss (muddy haul roads in opencast or underground pumping load)
            soil_slip_loss = max(0, soil_moisture_pct - 38.0) * (base_target / 75.0)
            
            # 4. Blasting delay loss:
            blasting_tonnes_loss = blasting_delay_hours * (base_target / 32.0)
            
            # 5. Labor deficit loss:
            labor_deficit_loss = max(0, 92.0 - labor_attendance_pct) * (base_target / 85.0)
            
            # Random unmodeled variation (noise)
            noise_loss = np.random.normal(0, base_target * 0.035)
            
            total_loss = downtime_tonnes_loss + weather_tonnes_loss + soil_slip_loss + blasting_tonnes_loss + labor_deficit_loss + noise_loss
            actual_output = int(max(base_target * 0.15, target_output - total_loss))
            
            shortfall_tonnes = max(0, target_output - actual_output)
            shortfall_pct = round((shortfall_tonnes / target_output) * 100.0, 2)
            
            # Categorical risk tier
            if shortfall_pct <= 6.0:
                shortfall_risk_tier = "Low"
            elif shortfall_pct <= 18.0:
                shortfall_risk_tier = "Medium"
            else:
                shortfall_risk_tier = "High"
                
            # Primary shortfall driver attribution
            loss_dict = {
                "equipment_downtime": downtime_tonnes_loss,
                "weather_stoppage": weather_tonnes_loss + soil_slip_loss,
                "blasting_delays": blasting_tonnes_loss,
                "labor_attendance": labor_deficit_loss,
            }
            primary_driver = max(loss_dict, key=loss_dict.get) if shortfall_tonnes > 20 else "nominal_operations"
            
            # Trucking and dispatch volume
            truck_dispatch_trips = int(actual_output / 24.5 + np.random.normal(0, 2))
            truck_dispatch_trips = max(5, truck_dispatch_trips)
            
            all_rows.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "site_id": site["site_id"],
                "site_name": site["name"],
                "day_of_week": current_date.strftime("%A"),
                "month": month,
                "target_tonnes": target_output,
                "actual_tonnes": actual_output,
                "shortfall_tonnes": shortfall_tonnes,
                "shortfall_pct": shortfall_pct,
                "shortfall_risk_tier": shortfall_risk_tier,
                "primary_driver": primary_driver,
                "rainfall_mm": rainfall_mm,
                "soil_moisture_pct": soil_moisture_pct,
                "surface_temp_c": surface_temp_c,
                "ndvi": ndvi,
                "total_downtime_hours": total_equipment_downtime_hours,
                "excavator_downtime_hours": excavator_downtime,
                "drill_downtime_hours": drill_downtime,
                "dumper_downtime_hours": dumper_downtime,
                "fleet_utilization_pct": fleet_utilization_pct,
                "blasting_delay_hours": blasting_delay_hours,
                "weather_stoppage_hours": weather_stoppage_hours,
                "labor_attendance_pct": labor_attendance_pct,
                "truck_dispatch_trips": truck_dispatch_trips,
            })
            
    return pd.DataFrame(all_rows)

def generate_equipment_registry(seed=202):
    """Generates detailed machinery telemetry, uptime, and predictive health risk."""
    np.random.seed(seed)
    machines = []
    
    types = [
        {"type": "Hydraulic Excavator", "prefix": "EXC", "make": "Komatsu PC400 / Tata Hitachi"},
        {"type": "Heavy Dumper Fleet", "prefix": "DMP", "make": "BEML BH60M (60 Ton)"},
        {"type": "Rotary Drill Rig", "prefix": "DRL", "make": "Atlas Copco / Sandvik DI550"},
        {"type": "Primary Ore Crusher", "prefix": "CRU", "make": "Metso Nordberg C130"},
        {"type": "Mine Dewatering Pump", "prefix": "PMP", "make": "Kirloskar High-Head Submersible"},
    ]
    
    for site in MINE_SITES:
        counter = 1
        for t in types:
            qty = 3 if t["prefix"] in ["EXC", "DRL"] else (6 if t["prefix"] == "DMP" else 1)
            for _ in range(qty):
                eq_id = f"{site['site_id'][:3].upper()}-{t['prefix']}-{counter:02d}"
                operating_hours = int(np.random.uniform(1800, 14500))
                uptime_pct = round(np.clip(np.random.normal(91.0, 6.0), 65.0, 99.5), 1)
                
                # Synthetic sensor telemetry
                hydraulic_pressure_bar = round(np.random.normal(240, 18), 1)
                engine_oil_temp_c = round(np.random.normal(88, 7), 1)
                vibration_rms_mms = round(np.random.normal(3.8, 1.2), 2)
                
                # Causal failure risk formula
                risk_score = 0
                if uptime_pct < 80.0: risk_score += 3
                if engine_oil_temp_c > 96.0: risk_score += 3
                if vibration_rms_mms > 5.5: risk_score += 4
                if operating_hours > 11000: risk_score += 2
                
                if risk_score >= 6:
                    failure_risk = "Critical"
                    status = "Maintenance Required"
                elif risk_score >= 3:
                    failure_risk = "Moderate"
                    status = "Operational (Under Watch)"
                else:
                    failure_risk = "Low"
                    status = "Operational (Healthy)"
                    
                days_ago_maint = int(np.random.uniform(5, 75))
                last_maint = (datetime.now() - timedelta(days=days_ago_maint)).strftime("%Y-%m-%d")
                
                machines.append({
                    "equipment_id": eq_id,
                    "site_id": site["site_id"],
                    "site_name": site["name"],
                    "equipment_type": t["type"],
                    "model_make": t["make"],
                    "status": status,
                    "failure_risk": failure_risk,
                    "uptime_pct": uptime_pct,
                    "total_operating_hours": operating_hours,
                    "hydraulic_pressure_bar": hydraulic_pressure_bar,
                    "engine_oil_temp_c": engine_oil_temp_c,
                    "vibration_rms_mms": vibration_rms_mms,
                    "last_maintenance_date": last_maint,
                    "days_since_maintenance": days_ago_maint,
                })
                counter += 1
                
    return pd.DataFrame(machines)

def main():
    print("=" * 70)
    print("OreSight ML Pipeline — Synthetic Dataset Generation")
    print("=" * 70)
    
    # 1. Mine sites
    df_sites = generate_mine_sites_df()
    sites_path = os.path.join(DATA_DIR, "mine_sites.csv")
    df_sites.to_csv(sites_path, index=False)
    print(f"✓ Saved mine metadata: {sites_path} ({len(df_sites)} sites)")
    
    # 2. Reserve Exploration Dataset
    df_reserves = generate_reserve_exploration_dataset(num_samples=500)
    reserves_path = os.path.join(DATA_DIR, "reserve_exploration.csv")
    df_reserves.to_csv(reserves_path, index=False)
    print(f"✓ Saved reserve exploration: {reserves_path} ({len(df_reserves)} blocks)")
    
    # 3. Daily Production Time Series
    df_daily = generate_daily_production_dataset(start_date="2023-01-01", days=1095)
    daily_path = os.path.join(DATA_DIR, "daily_production_equipment.csv")
    df_daily.to_csv(daily_path, index=False)
    print(f"✓ Saved daily production time-series: {daily_path} ({len(df_daily)} daily records)")
    
    # 4. Equipment Registry
    df_equipment = generate_equipment_registry()
    equipment_path = os.path.join(DATA_DIR, "equipment_registry.csv")
    df_equipment.to_csv(equipment_path, index=False)
    print(f"✓ Saved equipment registry: {equipment_path} ({len(df_equipment)} equipment units)")
    
    # Sanity checks and correlation inspection
    print("\n" + "=" * 70)
    print("SANITY CHECK & CAUSAL RELATIONSHIP VALIDATION")
    print("=" * 70)
    
    print("\n1. Reserve Exploration Feature Correlations with estimated_reserve_tonnes:")
    reserve_num = df_reserves[[
        "estimated_reserve_tonnes", "ore_grade_pct", "depth_m", 
        "gravity_anomaly_mgal", "spectral_band_ratio", "ndvi_anomaly", "drill_hole_density"
    ]].corr()["estimated_reserve_tonnes"].sort_values(ascending=False)
    print(reserve_num.to_string())
    
    print("\n2. Daily Production Feature Correlations with shortfall_tonnes:")
    prod_corr = df_daily[[
        "shortfall_tonnes", "total_downtime_hours", "excavator_downtime_hours", 
        "rainfall_mm", "weather_stoppage_hours", "blasting_delay_hours", "soil_moisture_pct"
    ]].corr()["shortfall_tonnes"].sort_values(ascending=False)
    print(prod_corr.to_string())
    
    print("\n3. Shortfall Risk Tier Distribution:")
    print(df_daily["shortfall_risk_tier"].value_counts(normalize=True).apply(lambda x: f"{x*100:.1f}%").to_string())
    
    print("\n4. Sample Daily Production Records (Head):")
    sample_cols = ["date", "site_name", "target_tonnes", "actual_tonnes", "shortfall_tonnes", "shortfall_risk_tier", "total_downtime_hours", "rainfall_mm", "primary_driver"]
    print(df_daily[sample_cols].head(5).to_string(index=False))
    
    print("\n✓ Dataset generation completed successfully.")

if __name__ == "__main__":
    main()
