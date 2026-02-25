import { component$ } from "@builder.io/qwik";
import Icon from "~/components/etc/ui/Icon";
import { MetricsInfo } from "~/models/infra.model";
import MetricsCard from "./MetricsCard";

interface SystemOverviewProps {
  metrics: MetricsInfo | null;
}

export default component$<SystemOverviewProps>(({ metrics }) => {
  if (!metrics) {
    return (
      <div class="mb-8 grid animate-pulse grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-2">
        {/* Active Services Skeleton */}
        <div class="h-38 rounded-lg bg-gray-100 lg:col-span-3 lg:row-span-2 dark:bg-gray-800"></div>
        {/* CPU Usage Skeleton */}
        <div class="h-38 rounded-lg bg-gray-100 lg:col-span-3 lg:row-span-2 dark:bg-gray-800"></div>
        {/* Memory Skeleton */}
        <div class="h-38 rounded-lg bg-gray-100 lg:col-span-4 lg:row-span-2 dark:bg-gray-800"></div>
        {/* Disk Read Skeleton */}
        <div class="h-16 rounded-lg bg-gray-100 lg:col-span-2 lg:row-span-1 dark:bg-gray-800"></div>
        {/* Disk Write Skeleton */}
        <div class="h-16 rounded-lg bg-gray-100 lg:col-span-2 lg:row-span-1 dark:bg-gray-800"></div>
      </div>
    );
  }

  return (
    <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-12 lg:grid-rows-2">
      {/* Active Services */}
      <MetricsCard
        title="Active Services"
        value={`${metrics.activeServices}/${metrics.totalServices}`}
        icon="🚀"
        progress={(metrics.activeServices / metrics.totalServices) * 100}
        progressColor="bg-teal-500"
        classes="lg:col-span-3 lg:row-span-2"
      />

      {/* CPU Usage */}
      <MetricsCard
        title="CPU Usage"
        value={`${metrics.cpuUsage}%`}
        icon="💻"
        progress={+metrics.cpuUsage}
        progressColor="bg-blue-600"
        classes="lg:col-span-3 lg:row-span-2"
      />

      {/* Memory */}
      <MetricsCard
        title="Memory"
        value={`${Math.round(
          (+metrics.usedMemory / +metrics.totalMemory) * 100,
        )}%`}
        icon="🧠"
        progress={(+metrics.usedMemory / +metrics.totalMemory) * 100}
        progressColor="bg-green-600"
        subtitle={`${metrics.usedMemory} MB / ${metrics.totalMemory} MB`}
        classes="lg:col-span-4 lg:row-span-2"
      />

      {/* Disk Read */}
      <div class="flex items-center gap-2 rounded-lg bg-white px-4 py-3 shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg lg:col-span-2 lg:row-span-1 dark:bg-gray-700">
        <Icon icon="save_as" class="text-blue-500" />
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400">Disk Read</p>
          <p class="text-md font-bold text-gray-900 dark:text-white">{`${metrics.diskUsage.read}`}</p>
        </div>
      </div>

      {/* Disk Write */}
      <div class="flex items-center gap-2 rounded-lg bg-white px-4 py-3 shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg lg:col-span-2 lg:row-span-1 dark:bg-gray-700">
        <Icon icon="save_clock" class="text-green-500" />
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400">Disk Write</p>
          <p class="text-md font-bold text-gray-900 dark:text-white">{`${metrics.diskUsage.write}`}</p>
        </div>
      </div>
    </div>
  );
});
