
import React from "react";
import { Button } from "@/components/ui/button";
import { X, Edit } from "lucide-react";

interface Education {
  degree: string;
  institution: string;
  startDate?: string;
  endDate?: string;
  fieldOfStudy?: string;
  year?: string;
  description?: string;
}

/** Display period: structured start–end preferred, legacy year as fallback. */
const eduPeriod = (edu: Education): string => {
  if (edu.startDate || edu.endDate) {
    return [edu.startDate, edu.endDate].filter(Boolean).join("–");
  }
  return edu.year || "";
};

interface EducationListProps {
  canEdit?: boolean;
  education: Education[];
  editingIndex: number | null;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  renderEditing: (index: number) => React.ReactNode;
}

const EducationList = ({
  education,
  editingIndex,
  onEdit,
  onDelete,
  renderEditing,
  canEdit = true,
}: EducationListProps) => {
  return (
    <div className="space-y-3 min-h-[100px]">
      {education.length > 0 ? (
        education.map((edu, index) => (
          <div key={index} className="p-3 border rounded-md">
            {editingIndex === index ? (
              renderEditing(index)
            ) : (
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium">{edu.degree}</h4>
                  <p className="text-gray-600">{edu.institution}</p>
                  {edu.fieldOfStudy && (
                    <p className="text-sm text-gray-500">Field of study: {edu.fieldOfStudy}</p>
                  )}
                  {eduPeriod(edu) && <p className="text-sm text-gray-500">{eduPeriod(edu)}</p>}
                  {edu.description && (
                    <p className="text-sm text-gray-700 mt-2">{edu.description}</p>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(index)}
                    aria-label={`Edit ${edu.degree || "education entry"}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(index)}
                    aria-label={`Remove ${edu.degree || "education entry"}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm p-3 border rounded-md">
          No education added yet. Add some education above.
        </p>
      )}
    </div>
  );
};

export default EducationList;
