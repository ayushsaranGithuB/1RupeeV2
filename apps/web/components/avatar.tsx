export function Avatar({
  name,
  size,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const sizeMap = {
    sm: 24,
    md: 32,
    lg: 48,
  };

  const pixelSize = size ? sizeMap[size] : sizeMap.md;

  return (
    <div
      className="rounded-full bg-emerald-600 font-semibold text-white overflow-hidden flex-shrink-0 flex items-center justify-center"
      style={{
        width: pixelSize,
        height: pixelSize,
        fontSize: pixelSize / 2,
      }}
    >
      {initials}
    </div>
  );
}
