import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { signUpSchema } from '@/lib/validationSchemas';
import { z } from 'zod';
import {Eye, EyeOff, ArrowLeft, ArrowRight} from 'lucide-react';

// STUDENTS & PROFESSIONALS: Account Type, Email, Password, Confirm Password, Full Name, Profession, Education Level, Skills,
// COMPANIES: Account Type, Company Email, Password, Confirm Password, Company Name, Profession, Years Active, Expertise

interface SignUpFormProps {
  showOtpModal: (email: string) => void
}

const STORAGE_KEY = "signup-progress"

const SignUpForm: React.FC<SignUpFormProps> = ({showOtpModal}) => {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(0);

  // form data
  const [form, setForm] = useState({
    userType: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    profession: "",
    educationLevel: "",
    skills: "",
    companyName: "",
    yearsActive: "",
    expertise: "",
  });

  // restore form data from local storage
  useEffect(() => {
    const storedForm = localStorage.getItem(STORAGE_KEY);
    if (storedForm) {
      setForm(JSON.parse(storedForm));
    }
  }, []);

  // save form data to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  const update = (field: string, value: string) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  };

  // slide to slide validation
  const validateStep = () => {
    switch (step) {
      case 0:
        return form.userType.trim() !== "";
      case 1:
        return form.email.trim() !== "";
      case 2:
        return form.password.length >= 6 && form.confirmPassword === form.password;
      case 3:
        return form.fullName.trim().length >= 2;
      case 4:
        return form.profession !== "";
      case 5:
        if (form.userType === "company") return form.companyName.trim() !== "";
        return form.educationLevel !== "";
      case 6:
        if (form.userType === "company") return form.yearsActive.trim() !== "";
        return form.skills.trim() !== "";
      default:
        return true;
    }
  };

  // slide navigation
  const next = () => {
    if (!validateStep()) {
      toast({
        title: "Missing Information",
        description: "Please complete this step before continuing.",
        variant: "destructive",
      });
      return;
    }
    const transition = setTimeout(() => setStep(step + 1), 500);
  };

  const back = () => setStep(step - 1);

  const jumpTo = (index: number) => {
    if (index <= step) setStep(index);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabaseFullName =
        form.userType === "company" ? form.companyName : form.fullName;

      const supabaseSkills =
        form.userType === "company"
          ? form.expertise.split(",").map((s) => s.trim())
          : form.skills.split(",").map((s) => s.trim());

      const { error } = await signUp(form.email, form.password, {
        full_name: supabaseFullName,
        user_type: form.userType,
        profession: form.profession,
        education_level: form.educationLevel || null,
        years_active: form.yearsActive || null,
        skills: supabaseSkills,
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
        localStorage.removeItem(STORAGE_KEY);
        showOtpModal(form.email);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  // slides
  const slides = [
    // 0 — ACCOUNT TYPE
    <div key="type">
      <Label>Account Type</Label>
      <Select
        value={form.userType}
        onValueChange={(v) => {
          update("userType", v);
          setStep(1);
        }}
      >
        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="student">Student</SelectItem>
          <SelectItem value="professional">Professional</SelectItem>
          <SelectItem value="company">Company</SelectItem>
        </SelectContent>
      </Select>
    </div>,

    // 1 — EMAIL
    <div key="email">
      <Label>Email</Label>
      <Input
        type="email"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
        placeholder="Enter your email"
        onKeyDown={(e) => e.key === "Enter" && next()}
      />
    </div>,

    // 2 — PASSWORD
    <div key="password">
      <Label>Password</Label>
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          placeholder="Create a password"
          className="pr-10"
          onKeyDown={(e) => e.key === "Enter" && next()}
        />
        <Button
          type="button"
          variant="link"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </Button>
      </div>

      <Label className="mt-4">Confirm Password</Label>
      <Input
        type={showPassword ? "text" : "password"}
        value={form.confirmPassword}
        onChange={(e) => update("confirmPassword", e.target.value)}
        placeholder="Confirm password"
        onKeyDown={(e) => e.key === "Enter" && next()}
      />
    </div>,

    // 3 — NAME (OR COMPANY NAME)
    <div key="name">
      <Label>{form.userType === "company" ? "Company Name" : "Full Name"}</Label>
      <Input
        value={form.userType === "company" ? form.companyName : form.fullName}
        onChange={(e) =>
          update(form.userType === "company" ? "companyName" : "fullName", e.target.value)
        }
        placeholder={
          form.userType === "company"
            ? "Enter company name"
            : "Enter your full name"
        }
        onKeyDown={(e) => e.key === "Enter" && next()}
      />
    </div>,

    // 4 — PROFESSION
    <div key="profession">
      <Label>Profession</Label>
      <Select
        value={form.profession}
        onValueChange={(v) => {
          update("profession", v);
          next();
        }}
      >
        <SelectTrigger><SelectValue placeholder="Select profession" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="architecture">Architecture</SelectItem>
          <SelectItem value="interior-design">Interior Design</SelectItem>
          <SelectItem value="quantity-surveying">Quantity Surveying</SelectItem>
          <SelectItem value="civil-engineering">Civil Engineering</SelectItem>
          <SelectItem value="mep-engineering">MEP Engineering</SelectItem>
          <SelectItem value="project-management">Project Management</SelectItem>
          <SelectItem value="project-finance">Project Finance</SelectItem>
          <SelectItem value="construction-supplies">Construction & Supplies</SelectItem>
          <SelectItem value="health-safety">Health & Safety</SelectItem>
          <SelectItem value="real-estate-development">Real Estate Development</SelectItem>
          <SelectItem value="urban-planning">Urban Planning</SelectItem>
          <SelectItem value="governance-policy">Governance & Policy</SelectItem>
          <SelectItem value="advocacy-awareness">Advocacy & Awareness</SelectItem>
        </SelectContent>
      </Select>
    </div>,

    // 5 — EDUCATION LEVEL OR YEARS ACTIVE
    form.userType === "company"
      ? (
        <div key="years">
          <Label>Years Active</Label>
          <Input
            value={form.yearsActive}
            onChange={(e) => update("yearsActive", e.target.value)}
            placeholder="e.g. 10"
            onKeyDown={(e) => e.key === "Enter" && next()}
          />
        </div>
      )
      : (
        <div key="education">
          <Label>Education Level</Label>
          <Select
            value={form.educationLevel}
            onValueChange={(v) => {
              update("educationLevel", v);
              next();
            }}
          >
            <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="diploma">Diploma</SelectItem>
              <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
              <SelectItem value="masters">Master's Degree</SelectItem>
              <SelectItem value="phd">PhD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),

    // 6 — SKILLS OR EXPERTISE
    form.userType === "company"
      ? (
        <div key="expertise">
          <Label>Expertise (comma separated)</Label>
          <Input
            value={form.expertise}
            onChange={(e) => update("expertise", e.target.value)}
            placeholder="e.g. manufacturing, logistics"
            onKeyDown={(e) => e.key === "Enter" && next()}
          />
        </div>
      )
      : (
        <div key="skills">
          <Label>Skills (comma separated)</Label>
          <Input
            value={form.skills}
            onChange={(e) => update("skills", e.target.value)}
            placeholder="e.g. AutoCAD, BIM, Revit"
            onKeyDown={(e) => e.key === "Enter" && next()}
          />
        </div>
      ),
  ];

  const isFinal = step === slides.length - 1;


  return (
    // <Card>
    //   <CardHeader>
    //     <CardTitle>Create account</CardTitle>
    //     <CardDescription>
    //       Join our learning community today
    //     </CardDescription>
    //   </CardHeader>
    //   <CardContent>
    //     <form onSubmit={handleSignUp} className="space-y-4">
    //       <div className="space-y-2">
    //         <Label htmlFor="signup-name">Full Name</Label>
    //         <Input
    //           id="signup-name"
    //           name="fullName"
    //           type="text"
    //           placeholder="Enter your full name"
    //           required
    //         />
    //       </div>
    //       <div className="space-y-2">
    //         <Label htmlFor="signup-email">Email</Label>
    //         <Input
    //           id="signup-email"
    //           name="email"
    //           type="email"
    //           placeholder="Enter your email"
    //           required
    //         />
    //       </div>
    //       <div className="space-y-2">
    //         <Label htmlFor="signup-password">Password</Label>
    //           <div className="relative">
    //             <Input
    //               id="signup-password"
    //               name="password"
    //               type={showPassword ? 'text' : 'password'}
    //               placeholder="Create a password"
    //               required
    //               minLength={6}
    //               className="pr-10"
    //             />
    //               <Button
    //                 type="button"
    //                 variant="link"
    //                 size="sm"
    //                 className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
    //                 onClick={() => setShowPassword(!showPassword)}
    //               >
    //                 {showPassword ? <EyeOff /> : <Eye/>}
    //               </Button>
    //         </div>
    //       </div>
    //       <div className="space-y-2">
    //         <Label htmlFor="signup-usertype">Account Type</Label>
    //         <Select name="userType" required>
    //           <SelectTrigger>
    //             <SelectValue placeholder="Select account type" />
    //           </SelectTrigger>
    //           <SelectContent>
    //             <SelectItem value="student">Student</SelectItem>
    //             {/* <SelectItem value="graduate">Graduate</SelectItem> */}
    //             <SelectItem value="professional">Professional</SelectItem>
    //             <SelectItem value="company">Company</SelectItem>
    //           </SelectContent>
    //         </Select>
    //       </div>
    //       <div className="space-y-2">
    //         <Label htmlFor="signup-profession">Profession</Label>
    //         <Select name="profession" required>
    //           <SelectTrigger>
    //             <SelectValue placeholder="Select your profession" />
    //           </SelectTrigger>
    //           <SelectContent>
    //             <SelectItem value="architecture">Architecture</SelectItem>
    //             <SelectItem value="interior-design">Interior Design</SelectItem>
    //             <SelectItem value="quantity-surveying">Quantity Surveying</SelectItem>
    //             <SelectItem value="civil-engineering">Civil Engineering</SelectItem>
    //             <SelectItem value="mep-engineering">MEP Engineering</SelectItem>
    //             <SelectItem value="project-management">Project Management</SelectItem>
    //             <SelectItem value="project-finance">Project Finance</SelectItem>
    //             <SelectItem value="construction-supplies">Construction & Supplies</SelectItem>
    //             <SelectItem value="health-safety">Health & Safety</SelectItem>
    //             <SelectItem value="real-estate-development">Real Estate Development</SelectItem>
    //             <SelectItem value="urban-planning">Urban Planning</SelectItem>
    //             <SelectItem value="governance-policy">Governance & Policy</SelectItem>
    //             <SelectItem value="advocacy-awareness">Advocacy & Awareness</SelectItem>
    //           </SelectContent>
    //         </Select>
    //       </div>
    //       <Button type="submit" className="w-full" disabled={isLoading}>
    //         {isLoading ? 'Creating account...' : 'Create Account'}
    //       </Button>
    //     </form>
    //   </CardContent>
    // </Card>

    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Join our learning community today
        </CardDescription>
       </CardHeader>
      <CardContent>
        <div className="space-y-6">

          {/* PROGRESS INDICATOR */}
          <div className="flex items-center justify-center gap-3">
            {slides.map((_, i) => (
              <div
                key={i}
                onClick={() => jumpTo(i)}
                className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-sm transition-colors duration-300
                  ${i === step ? 'bg-primary text-white transition' : i < step ? 'bg-green-500 text-white' : 'bg-muted'}
                `}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* SLIDE CONTENT */}
          <div>
            {slides[step]}
          </div>

          {/* NAVIGATION */}
          <div className="flex justify-end pt-4">
            {/* {step > 0 ? (
              <Button variant="ghost" onClick={back}>
                <ArrowLeft className="mr-2" /> Back
              </Button>
            ) : (
              <div />
            )} */}

            {!isFinal ? (
              <Button onClick={next} variant="default">
                Next <ArrowRight className="ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSignUp} disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Finish"}
              </Button>
            )}
          </div>

        </div>
      </CardContent>
    </Card>

   
  );
};

export default SignUpForm;
