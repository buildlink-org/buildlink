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
      label: "INDUSTRY\nEVENTS",
      icon: CalendarDays,
    },
    {
      label: "PUBLICATIONS",
      icon: BookOpen,
    },
    {
      label: "TECHNICAL\nDATA",
      icon: FileText,
    },
    {
      label: "LEGAL",
      icon: Scale,
    },
  ];

  return (
    <header className="relative overflow-hidden rounded-xl shadow-md">
      {/* Main banner background */}
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(135deg, hsl(10 78% 34%) 0%, hsl(8 82% 39%) 55%, hsl(7 78% 32%) 100%)",
        }}
      />

      {/* Subtle background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Decorative glow */}
      <div
        className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full blur-3xl"
        aria-hidden
        style={{
          background: "hsl(8 90% 55% / 0.25)",
        }}
      />

      {/* Content */}
      <div className="relative px-5 py-4 sm:px-6 sm:py-5">
        {/* Heading */}
        <div className="mb-3">
          <h2 className="text-lg font-bold leading-tight text-white sm:text-xl">
            Resource Hub
          </h2>

          <p className="mt-0.5 max-w-2xl text-xs leading-relaxed text-white/90 sm:text-sm">
            Your One-Stop shop to help stay relevant, manage projects
            efficiently, and ensure compliance.
          </p>
        </div>

        {/* Resource category tags */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {resourceTags.map(({ label, icon: Icon }) => (
            <div
              key={label}
              className="
                flex min-h-[62px]
                flex-col items-center justify-center
                rounded-lg
                border border-white/10
                bg-white/[0.10]
                px-2 py-2
                text-center
                backdrop-blur-sm
                transition-all
                duration-200
                hover:bg-white/[0.17]
              "
            >
              <Icon
                className="mb-1.5 h-5 w-5 text-white/80"
                strokeWidth={1.8}
                aria-hidden
              />

              <span className="whitespace-pre-line text-[11px] font-bold leading-tight text-white sm:text-xs">
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