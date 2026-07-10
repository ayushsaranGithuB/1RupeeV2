export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-xl font-semibold text-white">
      {initials}
    </div>
  );
}
