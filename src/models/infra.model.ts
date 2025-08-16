import { ContainerInfo, ContainerStats } from "dockerode";

export interface DockerContainerWithStats extends ContainerInfo {
  stats: ContainerStats;
}

export type ServicesStatus = DockerContainerWithStats[];

export interface MetricsInfo {
  activeServices: number;
  totalServices: number;
  cpuUsage: string;
  totalMemory: string;
  usedMemory: string;
  freeMemory: string;
  diskUsage: {
    read: string;
    write: string;
  };
}
