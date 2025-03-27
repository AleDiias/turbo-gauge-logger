
// Standard OBD-II PIDs
export const OBD_PIDS = {
  ENGINE_RPM: '010C',               // RPM
  VEHICLE_SPEED: '010D',            // Vehicle speed
  COOLANT_TEMP: '0105',             // Engine coolant temperature
  INTAKE_TEMP: '010F',              // Intake air temperature
  MAF_RATE: '0110',                 // Mass air flow rate
  THROTTLE_POS: '0111',             // Throttle position
  ENGINE_LOAD: '0104',              // Engine load
  BOOST_PRESSURE: '010B',           // Intake manifold pressure (can indicate boost)
  BATTERY_VOLTAGE: '0142',          // Control module voltage
  FUEL_RATE: '015E',                // Fuel rate
  FUEL_LEVEL: '012F',               // Fuel level input
  DTC_COUNT: '0101',                // Diagnostic Trouble Codes count
};

// Service and characteristic UUIDs for ELM327 over BLE
export const BLE_UUIDS = {
  OBD_SERVICE_UUID: '0000fff0-0000-1000-8000-00805f9b34fb',
  OBD_WRITE_UUID: '0000fff2-0000-1000-8000-00805f9b34fb',
  OBD_NOTIFY_UUID: '0000fff1-0000-1000-8000-00805f9b34fb',
};
