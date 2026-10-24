export interface Skill {
  name: string;
}

export const BUILT_ENVIRONMENT_SKILLS = [
  "Architecture",
  "BIM",
  "Civil Engineering",
  "Construction Management",
  "Cost Estimation",
  "GIS",
  "Interior Design",
  "Landscape Architecture",
  "Project Management",
  "Quantity Surveying",
  "Revit",
  "Structural Engineering",
  "Sustainable Design",
  "Urban Planning",
];

// Convert legacy string skills and sanitize malformed skill objects
export const convertAndSanitizeSkills = (skills: any[]): Skill[] => {
  if (!skills) return [];
  return skills
    .map((skill) => {
      if (typeof skill === "string") {
        // For simple strings, create a skill object
        return { name: skill };
      }
      if (typeof skill === "object" && skill !== null) {
        let name = skill.name;

        // Check if name is a stringified JSON object
        if (typeof name === "string" && name.startsWith("{")) {
          try {
            const parsedName = JSON.parse(name);
            if (
              parsedName &&
              typeof parsedName === "object" &&
              parsedName.name
            ) {
              name = parsedName.name;
            }
          } catch (e) {
            // Not a JSON string, keep original name
          }
        }

        // Ensure name is a string
        if (typeof name === "string" && name.trim()) {
          return { name: name.trim() };
        }
      }
      return null; // Filter out invalid entries
    })
    .filter(
      (skill): skill is Skill =>
        skill !== null && typeof skill.name === "string"
    );
};