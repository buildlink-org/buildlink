import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { signUpSchema } from '@/lib/validationSchemas';
import { supabase } from '@/integrations/supabase/client';
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus on slide change
  useEffect(() => {
    if (step > 0 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

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
     // Clear error for this field when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // slide to slide validation
   const validateCurrentStep = (): boolean => {
    setErrors({});
   

    try {
      switch (step) {
        case 0: // Account Type
          if (!form.userType.trim()) {
            setErrors({ userType: "Please select an account type" });
            return false;
          }
          break;

        case 1: {// Email
          // baseSchema.shape.email.parse(form.email);
          const emailValue = form.email.trim();
          if (!emailValue) {
          setErrors({ email: "Email is required" });
          return false;
         }
          // Basic email validation regex
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(emailValue)) {
            setErrors({ email: "Invalid email address" });
            return false;
          }
          if (emailValue.length > 255) {
            setErrors({ email: "Email must be less than 255 characters" });
            return false;
          }
        }
          break;

        case 2: // Password
            // baseSchema.shape.password.parse(form.password);
            if (!form.password) {
              setErrors({ password: "Password is required" });
              return false;
            }
            if (form.password.length < 6) {
              setErrors({ password: "Password must be at least 6 characters" });
              return false;
            }
            if (form.password.length > 128) {
              setErrors({ password: "Password must be less than 128 characters" });
              return false;
            }
          break;

        case 3: // Confirm Password
          if (form.confirmPassword !== form.password) {
            setErrors({ confirmPassword: "Passwords do not match" });
            return false;
          }
          if (!form.confirmPassword) {
            setErrors({ confirmPassword: "Please confirm your password" });
            return false;
          }
          break;

        case 4: // Full Name / Company Name
          if (form.userType === "company") {
            if (!form.companyName.trim()) {
              setErrors({ companyName: "Company name is required" });
              return false;
            }
            if (form.companyName.trim().length < 2) {
              setErrors({ companyName: "Company name must be at least 2 characters" });
              return false;
            }
          } else {
            if (!form.fullName.trim()) {
              setErrors({ fullName: "Full name is required" });
              return false;
            }
            if (form.fullName.trim().length < 2) {
              setErrors({ fullName: "Full name must be at least 2 characters" });
              return false;
            }
          }
          break;

        case 5: // Profession
          if (!form.profession) {
            setErrors({ profession: "Please select a profession" });
            return false;
          }
          break;

        case 6: // Education Level / Years Active
          if (form.userType === "company") {
            if (!form.yearsActive.trim()) {
              setErrors({ yearsActive: "Enter some value" });
              return false;
            }
            if (isNaN(Number(form.yearsActive)) || Number(form.yearsActive) < 0) {
              setErrors({ yearsActive: "Please enter a valid number" });
              return false;
            }
          } else {
            if (!form.educationLevel) {
              setErrors({ educationLevel: "Please select an education level" });
              return false;
            }
          }
          break;

        case 7: // Skills / Expertise
          if (form.userType === "company") {
            if (!form.expertise.trim()) {
              setErrors({ expertise: "Include at least 1 expertise" });
              return false;
            }
          } else {
            if (!form.skills.trim()) {
              setErrors({ skills: "Add at least 1 skill" });
              return false;
            }
          }
          break;

        default:
          return true;
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors[0];
        const fieldName = fieldError.path[0] as string;
        setErrors({ [fieldName]: fieldError.message });
        return false;
      }
      return false;
    }
  };

  // slide navigation
  const next = () => {
    if (!validateCurrentStep()) {
        return;
    }
    setStep(step + 1)
    const transition = setTimeout(() => setStep(step + 1), 300);
  };

  const back = () => setStep(step - 1);

  const jumpTo = (index: number) => {
    if (index <= step) setStep(index);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!validateCurrentStep()) {
      return;
    }
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("fullName", form.userType === "company" ? form.companyName : form.fullName);
      formData.append("userType", form.userType);
      formData.append("profession", form.profession);

      const rawData = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        fullName: formData.get("fullName") as string,
        userType: formData.get("userType") as string,
        profession: formData.get("profession") as string,
      };

      const validatedData = signUpSchema.parse(rawData);

      const supabaseSkills =
        validatedData.userType === "company"
          ? form.expertise.split(",").map((s) => s.trim())
          : form.skills.split(",").map((s) => s.trim());
       

      const { data, error } = await signUp(validatedData.email, validatedData.password, {
        full_name: validatedData.fullName,
        user_type: validatedData.userType,
        profession: validatedData.profession,
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
        return;
      } else if (data.user?.identities?.length ===0) {
        toast({
          title: "Account exists",
          description: "You are already signed up. Please login",
          variant: "destructive",
        }) 
      }
      else {
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
          });
        localStorage.removeItem(STORAGE_KEY);
        showOtpModal(validatedData.email);
      } 
    } catch (err) {
        if (err instanceof z.ZodError) {
      // Zod schema errors
      toast({
        title: "Validation Error",
        description: err.errors[0].message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
    } finally {
      setIsLoading(false);

    }

  };

  // Error display component
  const ErrorMessage = ({ field }: { field: string }) => {
    return errors[field] ? (
      <p className="text-sm text-red-500 mt-1">{errors[field]}</p>
    ) : null;
  };

  // slides
  const slides = [
    // 0 — ACCOUNT TYPE
    <div key="type">
      <Label>Account Type</Label>
      <Select
        // ref={step === 1 ? inputRef : null}
        value={form.userType}
        onValueChange={(v) => {
          update("userType", v);
          setStep(1);
        }}
      >
        <SelectTrigger className={errors.userType ? "border-red-500" : ""}>
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="student">Student</SelectItem>
          <SelectItem value="professional">Professional</SelectItem>
          <SelectItem value="company">Company</SelectItem>
        </SelectContent>
      </Select>
      <ErrorMessage field="userType" />
    </div>,

    // 1 — EMAIL
    <div key="email">
      <Label>Email</Label>
      <Input
        ref={inputRef}
        type="email"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
        // change placeholder based on userType
        placeholder={form.userType === "company" ? "Enter company email" : "Enter your email"}
        onKeyDown={(e) => e.key === "Enter" && next()}
        className={errors.email ? "border-red-500" : ""}
      />
      <ErrorMessage field="email" />
    </div>,

    // 2 — PASSWORD
    <div key="password">
      <Label>Password</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          type={showPassword ? "text" : "password"}
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          placeholder="Create a password"
          className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
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
      <ErrorMessage field="password" />
    </div>,

    // 3 - CONFIRM PASSWORD
    <div key="confirm-password">
      <Label>Confirm Password</Label>
      <div className="relative">
          <Input
            ref={inputRef}
            type={showPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            placeholder="Confirm password"
            onKeyDown={(e) => e.key === "Enter" && next()}
            className={errors.confirmPassword ? "border-red-500" : ""}
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
        <ErrorMessage field="confirmPassword" />
    </div>,

    // 4 — NAME (OR COMPANY NAME)
    <div key="name">
      <Label>{form.userType === "company" ? "Company Name" : "Full Name"}</Label>
      <Input
        ref={inputRef}
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
        className={errors.fullName || errors.companyName ? "border-red-500" : ""}        
      />
      <ErrorMessage field={form.userType === "company" ? "companyName" : "fullName"} />
    </div>,

    // 5 — PROFESSION
    <div key="profession">
      <Label>Profession</Label>
      <Select    
        value={form.profession}
        onValueChange={(v) => {
          update("profession", v);
          // next();
          setStep(6)
        }}
      >
        <SelectTrigger className={errors.profession ? "border-red-500" : ""}>
          <SelectValue placeholder="Select profession" />
        </SelectTrigger>
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
      <ErrorMessage field="profession" />
    </div>,

    // 6 — EDUCATION LEVEL OR YEARS ACTIVE
    form.userType === "company"
      ? (
        <div key="years">
          <Label>Years Active</Label>
          <Input
            ref={inputRef}
            type='number'
            value={form.yearsActive}
            onChange={(e) => update("yearsActive", e.target.value)}
            placeholder="e.g. 10"
            onKeyDown={(e) => e.key === "Enter" && next()}
            className={errors.yearsActive ? "border-red-500" : ""}
          />
          <ErrorMessage field="yearsActive" />
        </div>
      )
      : (
        <div key="education">
          <Label>Education Level</Label>
          <Select
            value={form.educationLevel}
            onValueChange={(v) => {
              update("educationLevel", v);
              // next();
              setStep(7)
            }}
          >
            <SelectTrigger className={errors.educationLevel ? "border-red-500" : ""}>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="diploma">Diploma</SelectItem>
              <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
              <SelectItem value="masters">Master's Degree</SelectItem>
              <SelectItem value="phd">PhD</SelectItem>
            </SelectContent>
          </Select>
          <ErrorMessage field="educationLevel" />
        </div>
      ),

    // 7 — SKILLS OR EXPERTISE
    form.userType === "company"
      ? (
        <div key="expertise">
          <Label>Expertise (comma separated)</Label>
          <Input
            ref={inputRef}
            value={form.expertise}
            onChange={(e) => update("expertise", e.target.value)}
            placeholder="e.g. manufacturing, logistics"
            onKeyDown={(e) => e.key === "Enter" && next()}
            className={errors.expertise ? "border-red-500" : ""}
          />
          <ErrorMessage field="expertise" />
        </div>
      )
      : (
        <div key="skills">
          <Label>Skills (comma separated)</Label>
          <Input
            ref={inputRef}
            value={form.skills}
            onChange={(e) => update("skills", e.target.value)}
            placeholder="e.g. AutoCAD, BIM, Revit"
            onKeyDown={(e) => e.key === "Enter" && next()}
            className={errors.skills ? "border-red-500" : ""}
          />
          <ErrorMessage field="skills" />
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
                  ${i === step ? 'bg-primary text-white transition' : i < step ? 'bg-green-900 text-white' : 'bg-muted'}
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
