
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ProfileFormFieldsProps {
  profile: {
    full_name: string;
    profession: string;
    organization: string;
    education_level: string;
  };
  onChange: (field: "full_name" | "profession" | "organization" | "education_level", value: string) => void;
}

const ProfileFormFields: React.FC<ProfileFormFieldsProps> = ({
  profile,
  onChange,
}) => (
  <div className="space-y-4">
    <div>
      <Label htmlFor="full_name">Full Name</Label>
      <Input
        id="full_name"
        value={profile.full_name}
        onChange={(e) => onChange("full_name", e.target.value)}
        placeholder="Enter your full name"
      />
    </div>
    <div>
      <Label htmlFor="profession">Course / Discipline</Label>
      <Input
        id="profession"
        value={profile.profession}
        onChange={(e) => onChange("profession", e.target.value)}
        placeholder="e.g., Civil Engineering, Architecture"
      />
    </div>
    <div>
      <Label htmlFor="organization">University / College</Label>
      <Input
      id="organization"
      value={profile.organization}
      onChange={(e) => onChange("organization", e.target.value)}
      placeholder="Your university or college"
      />
    </div>
    <div>
      <Label htmlFor="education_level">Education Level</Label>
      <Select
      value={profile.education_level}
      onValueChange={(value) => onChange("education_level", value)}
      >
      <SelectTrigger id="education_level">
        <SelectValue placeholder="Select your education level" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="certificate">Certificate</SelectItem>
        <SelectItem value="diploma">Diploma</SelectItem>
        <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
        <SelectItem value="masters">Master's Degree</SelectItem>
        <SelectItem value="phd">PhD</SelectItem>
      </SelectContent>
      </Select>
    </div>
  </div>
);

export default ProfileFormFields;
