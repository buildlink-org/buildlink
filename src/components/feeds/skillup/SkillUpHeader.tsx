import {
  Award,
  BookOpen,
  CalendarDays,
  FileText,
  Scale,
} from "lucide-react";

const SkillUpHeader = () => {
  const resourceTags = [
    {
      label: "COURSES",
      icon: Award,
    },
    {
      label: "INDUSTRY EVENTS",
      icon: CalendarDays,
    },
    {
      label: "PUBLICATIONS",
      icon: BookOpen,
    },
    {
      label: "TECHNICAL DATA",
      icon: FileText,
    },
    {
      label: "LEGAL & COMPLIANCE",
      icon: Scale,
    },
  ];

  return (
    <header className="relative overflow-hidden rounded-lg shadow-md">
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(135deg, hsl(10 78% 34%) 0%, hsl(8 82% 39%) 55%, hsl(7 78% 32%) 100%)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      <div
        className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full blur-3xl"
        aria-hidden
        style={{
          background: "hsl(8 90% 55% / 0.25)",
        }}
      />

      <div className="relative p-6">
        <div className="mb-4">
          <h1 className="mb-2 text-2xl font-bold leading-tight text-white">
            Resource Hub
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-white">
            Your One-Stop shop to help stay relevant, manage projects efficiently, and ensure compliance.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {resourceTags.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="
                flex min-h-[62px]
                flex-col items-center justify-center
                rounded-lg
                border border-white/20
                bg-white/10
                px-2 py-2.5
                text-center
                text-white
              "
            >
              <Icon
                className="mb-1 h-5 w-5 text-white/80"
                strokeWidth={1.8}
                aria-hidden
              />

              <span className="text-xs font-bold leading-tight sm:text-sm">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
};

export default SkillUpHeader;