
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Education {
  degree: string;
  institution: string;
  /** Structured study period */
  startDate?: string;
  endDate?: string;
  /** Field of study / major, e.g. "Information Technology" */
  fieldOfStudy?: string;
  /** Legacy free-form year/duration — kept so existing entries stay editable */
  year?: string;
  description?: string;
}

interface EducationFormFieldsProps {
  education: Education;
  onChange: (edu: Education) => void;
  idPrefix: string;
  showLabels?: boolean;
  disabled?: boolean;
}

const EducationFormFields = ({
  education,
  onChange,
  idPrefix,
  showLabels = true,
  disabled = false,
}: EducationFormFieldsProps) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          {showLabels && <Label htmlFor={`${idPrefix}-degree`}>Degree/Certification</Label>}
          <Input
            id={`${idPrefix}-degree`}
            value={education.degree}
            onChange={(e) => onChange({ ...education, degree: e.target.value })}
            placeholder="e.g., Bachelor of Civil Engineering"
            disabled={disabled}
          />
        </div>
        <div>
          {showLabels && <Label htmlFor={`${idPrefix}-institution`}>Institution</Label>}
          <Input
            id={`${idPrefix}-institution`}
            value={education.institution}
            onChange={(e) => onChange({ ...education, institution: e.target.value })}
            placeholder="e.g., University of Nairobi"
            disabled={disabled}
          />
        </div>
      </div>
      <div>
        {showLabels && <Label htmlFor={`${idPrefix}-fieldOfStudy`}>Field of Study (Optional)</Label>}
        <Input
          id={`${idPrefix}-fieldOfStudy`}
          value={education.fieldOfStudy || ""}
          onChange={(e) => onChange({ ...education, fieldOfStudy: e.target.value })}
          placeholder="e.g., Structural Engineering, Urban Planning"
          disabled={disabled}
        />
      </div>
      {/* Structured study period (report §6.4) — replaces the legacy free-form year field */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          {showLabels && <Label htmlFor={`${idPrefix}-startDate`}>Start year</Label>}
          <Input
            id={`${idPrefix}-startDate`}
            value={education.startDate || ""}
            onChange={(e) => onChange({ ...education, startDate: e.target.value })}
            placeholder="e.g., 2021"
            inputMode="numeric"
            disabled={disabled}
          />
        </div>
        <div>
          {showLabels && <Label htmlFor={`${idPrefix}-endDate`}>End year (or expected)</Label>}
          <Input
            id={`${idPrefix}-endDate`}
            value={education.endDate || ""}
            onChange={(e) => onChange({ ...education, endDate: e.target.value })}
            placeholder="e.g., 2025 or Present"
            disabled={disabled}
          />
        </div>
      </div>
      {/* Legacy free-form year/duration — shown only for entries that already use it */}
      {education.year ? (
        <div>
          {showLabels && (
            <Label htmlFor={`${idPrefix}-year`}>Year/Duration (legacy)</Label>
          )}
          <Input
            id={`${idPrefix}-year`}
            value={education.year}
            onChange={(e) => onChange({ ...education, year: e.target.value })}
            placeholder="e.g., 2015-2019 or 2020"
            disabled={disabled}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Prefer the Start/End year fields above — this legacy field is kept only for older entries.
          </p>
        </div>
      ) : null}
      <div>
        {showLabels && (
          <Label htmlFor={`${idPrefix}-description`}>Description (Optional)</Label>
        )}
        <Textarea
          id={`${idPrefix}-description`}
          value={education.description}
          onChange={(e) => onChange({ ...education, description: e.target.value })}
          placeholder="Relevant coursework, achievements, or specializations..."
          rows={3}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default EducationFormFields;
