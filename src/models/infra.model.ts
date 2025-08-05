export interface ServiceStatus {
  id: string;
  name: string;
  status: "running" | "stopped" | "error" | "warning";
  uptime: string;
  cpu: number;
  memory: number;
  ports: string[];
  lastUpdated: string;
}

export interface SystemMetrics {
  totalMemory: number;
  usedMemory: number;
  cpuUsage: number;
  diskUsage: number;
  activeServices: number;
  totalServices: number;
}
