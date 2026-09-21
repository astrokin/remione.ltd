import { imageInfo } from "../catalog";
import { devicePresentation } from "../device-presentation.mjs";

export default function DevicePreview({
  src,
  platforms,
  alt = "",
  className = "",
  priority = false,
}) {
  const size = imageInfo[src];
  const { device, shape, landscape } = devicePresentation(platforms, size);
  return (
    <div
      className={`device-preview device-${device} device-${shape} ${landscape ? "device-landscape" : ""} ${className}`}
      data-device={device}
      data-shape={shape}
    >
      <span className="device-hardware" aria-hidden="true">
        <i />
      </span>
      <div className="device-display">
        <img
          src={src}
          alt={alt}
          width={size.width}
          height={size.height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
        />
      </div>
      <span className="device-chin" aria-hidden="true">
        <i />
      </span>
    </div>
  );
}
