enum DeviceStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  UNKNOWN = "unknown",
}

export const mapStatusToClass = (status: DeviceStatus): string => {
  switch (status) {
    case DeviceStatus.ONLINE:
      return "bg-green-100 text-green-800";
    case DeviceStatus.OFFLINE:
      return "bg-red-100 text-red-800";
    case DeviceStatus.UNKNOWN:
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const batteryIcon = (percent: number = 0): string => {
  if (percent <= 0) return "battery_android_0";
  if (percent > 0.9) return "battery_android_full";
  if (percent > 0.85) return "battery_android_6";
  if (percent > 0.75) return "battery_android_5";
  if (percent > 0.6) return "battery_android_4";
  if (percent > 0.4) return "battery_android_3";
  if (percent > 0.25) return "battery_android_2";
  if (percent > 0.1) return "battery_android_1";
  return "battery_android_0";
};

export const mapBatteryLevelToClass = (level: number = 0): string => {
  if (level > 0.5) return "text-green-500 dark:text-green-700";
  if (level > 0.15) return "text-yellow-500 dark:text-yellow-700";
  if (level > 0) return "text-red-500 dark:text-red-700";
  return "text-gray-500";
};
