import { component$ } from "@builder.io/qwik";

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  progress?: number;
  subtitle?: string;
  progressColor?: string;
}

export default component$<MetricsCardProps>(
  ({
    title,
    value,
    icon,
    color,
    progress,
    subtitle,
    progressColor = "bg-blue-600",
  }) => {
    return (
      <div class="hover:-translate-0.5 rounded-lg bg-white p-6 shadow-lg transition-all duration-200 hover:shadow-xl dark:bg-gray-800">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
          </div>
          <div class="text-2xl">{icon}</div>
        </div>
        {progress !== undefined && (
          <div class="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              class={`h-2 rounded-full ${progressColor}`}
              style={`width: ${progress}%`}
            ></div>
          </div>
        )}
        {subtitle && <p class="mt-1 text-xs text-gray-500">{subtitle}</p>}
      </div>
    );
  },
);
