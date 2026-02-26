
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Experience {
  title: string;
  company: string;
  duration: string;
  description?: string;
}

interface ExperienceFormFieldsProps {
  experience: Experience;
  onChange: (exp: Experience) => void;
  idPrefix: string;
  showLabels?: boolean;
  disabled?: boolean;
}

const ExperienceFormFields = ({
  experience,
  onChange,
  idPrefix,
  showLabels = true,
  disabled = false,
}: ExperienceFormFieldsProps) => {
  
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          {showLabels && <Label htmlFor={`${idPrefix}-title`}>Job Title</Label>}
          <Input
            id={`${idPrefix}-title`}
            value={experience.title}
            onChange={(e) => onChange({ ...experience, title: e.target.value })}
            placeholder="e.g., Senior Civil Engineer"
            disabled={disabled}
          />
        </div>
        <div>
          {showLabels && <Label htmlFor={`${idPrefix}-company`}>Company</Label>}
          <Input
            id={`${idPrefix}-company`}
            value={experience.company}
            onChange={(e) => onChange({ ...experience, company: e.target.value })}
            placeholder="e.g., ABC Construction Ltd"
            disabled={disabled}
          />
        </div>
      </div>
      <div>
        {showLabels && <Label htmlFor={`${idPrefix}-duration`}>Duration</Label>}
        <Input
          id={`${idPrefix}-duration`}
          value={experience.duration}
          onChange={(e) => onChange({ ...experience, duration: e.target.value })}
          placeholder="e.g., Jan 2020 - Present"
          disabled={disabled}
        />
      </div>
      <div>
        {showLabels && (
          <Label htmlFor={`${idPrefix}-description`}>Description (Optional)</Label>
        )}
        <Textarea
          id={`${idPrefix}-description`}
          value={experience.description}
          onChange={(e) => onChange({ ...experience, description: e.target.value })}
          placeholder="Describe your key responsibilities and achievements..."
          rows={3}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default ExperienceFormFields;
