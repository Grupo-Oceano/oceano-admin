import { $, component$, JSX, PropFunction, useSignal } from "@builder.io/qwik";

export interface ImageProps extends Omit<JSX.IntrinsicElements["img"], "onError$"> {
  /**
   * Fallback image src if the main image fails to load
   */
  fallbackSrc?: string | boolean;
  /**
   * Custom onError handler (optional, called after fallback logic)
   */
  onError$?: PropFunction<(ev: Event) => void>;
  /**
   * Alternative fallback icon if the main image fails to load
   */
  fallbackIcon?: string | JSX.Element | boolean;
  iconClass?: string;
}

/**
 * Highly customizable Image component with built-in fallback logic.
 */
export default component$<ImageProps>(({ src,
  fallbackSrc,
  onError$,
  alt = "",
  fallbackIcon = true,
  iconClass = "text-4xl!",
  ...rest
}) => {
  const error = useSignal<boolean>(false);

  // Determine fallback image src (if enabled)
  const fallbackImageSrc =
    fallbackSrc === true
      ? "/assets/images/fallback.png"
      : typeof fallbackSrc === "string"
        ? fallbackSrc
        : undefined;

  // Determine fallback icon (if enabled)
  const fallbackIconNode =
    fallbackIcon === true
      ? <span class={["material-symbols-rounded", iconClass]}>image</span>
      : typeof fallbackIcon === "string"
        ? <span class={["material-symbols-rounded", iconClass]}>{fallbackIcon}</span>
        : fallbackIcon === false
          ? null
          : fallbackIcon;

  // Stable error handler
  const handleError = $(async (ev: Event) => {
    error.value = true;
    const target = ev.target as HTMLImageElement;
    if (fallbackImageSrc && !target.src.endsWith(fallbackImageSrc)) {
      target.src = fallbackImageSrc;
      target.onerror = null;
      return;
    }
    if (onError$) {
      await onError$(ev);
    }
  });

  // On error, show fallback image if enabled, else fallback icon if enabled, else nothing
  if (error.value) {
    if (fallbackImageSrc) {
      // Show fallback image (with icon as alt if provided)
      return (
        <img
          src={fallbackImageSrc}
          alt={alt}
          {...rest}
        />
      );
    } else if (fallbackIconNode) {
      return fallbackIconNode;
    } else {
      return null;
    }
  }

  return (
    <img
      src={src}
      alt={alt}
      onError$={handleError}
      {...rest}
    />
  );
});
