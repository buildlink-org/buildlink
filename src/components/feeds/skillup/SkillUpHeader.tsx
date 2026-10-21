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
    <header className="min-w-0 overflow-hidden rounded-lg bg-gradient-to-r from-primary to-primary/80 p-4 text-white sm:p-6">
      <div className="mb-4">
        <h1 className="mb-2 text-xl font-bold leading-tight sm:text-2xl">
          Resource Hub
        </h1>

        <p className="break-words text-sm leading-relaxed text-white sm:text-base">
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
    </header>
  );
};

export default SkillUpHeader;