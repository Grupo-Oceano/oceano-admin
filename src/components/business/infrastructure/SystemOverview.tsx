import { component$ } from "@builder.io/qwik";
import { SystemMetrics } from "~/models/infra.model";
import MetricsCard from "./MetricsCard";

interface SystemOverviewProps {
  metrics: SystemMetrics;
}

export default component$<SystemOverviewProps>(({ metrics }) => {
  return (
    <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricsCard
        title="Active Services"
        value={`${metrics.activeServices}/${metrics.totalServices}`}
        icon="🚀"
        color="text-teal-500"
        progress={(metrics.activeServices / metrics.totalServices) * 100}
        progressColor="bg-teal-500"
      />

      <MetricsCard
        title="CPU Usage"
        value={`${metrics.cpuUsage}%`}
        icon="💻"
        color="text-blue-600"
        progress={metrics.cpuUsage}
        progressColor="bg-blue-600"
      />

      <MetricsCard
        title="Memory"
        value={`${Math.round(
          (metrics.usedMemory / metrics.totalMemory) * 100,
        )}%`}
        icon="🧠"
        color="text-green-600"
        progress={(metrics.usedMemory / metrics.totalMemory) * 100}
        progressColor="bg-green-600"
        subtitle={`${metrics.usedMemory} MB / ${metrics.totalMemory} MB`}
      />

      <MetricsCard
        title="Disk Usage"
        value={`${metrics.diskUsage}%`}
        icon="💾"
        color="text-yellow-600"
        progress={metrics.diskUsage}
        progressColor="bg-yellow-600"
      />
    </div>
  );
});
