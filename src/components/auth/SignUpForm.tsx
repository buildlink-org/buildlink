import React, { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { signUpSchema } from "@/lib/validationSchemas"
import { z } from "zod"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { studentProfessionOptions, companyProfessionOptions, companyYearsActive, studentEducationLevel, skillsByProfession, expertiseByProfession } from '@/lib/signUpData'
import SkillsAutocomplete from "./SkillsAutocomplete"

interface SignUpFormProps {
	showOtpModal: (email: string) => void
}

const STORAGE_KEY = "signup-progress"

const SignUpForm: React.FC<SignUpFormProps> = ({ showOtpModal }) => {
	const { signUp } = useAuth()
	const { toast } = useToast()
	const [isLoading, setIsLoading] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [step, setStep] = useState(0)

	const [form, setForm] = useState({
		userType: "",
		email: "",
		password: "",
		confirmPassword: "",
		fullName: "",
		profession: "",
		educationLevel: "",
		skills: [] as string[],
		companyName: "",
		yearsActive: "",
		expertise: [] as string[],
	})
console.log({form});

	const [errors, setErrors] = useState<Record<string, string>>({})
	const inputRef = useRef<HTMLInputElement | null>(null)

	useEffect(() => {
		if (step > 0 && inputRef.current) {
			inputRef.current.focus()
		}
	}, [step])

	useEffect(() => {
		const storedForm = localStorage.getItem(STORAGE_KEY)
		if (storedForm) {
			setForm(JSON.parse(storedForm))
		}
	}, [])

	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
	}, [form])

	const update = (field: string, value: string) => {
		setForm((prevForm) => ({
			...prevForm,
			[field]: value,
		}))
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = { ...prev }
				delete newErrors[field]
				return newErrors
			})
		}
	}

	const validateCurrentStep = (): boolean => {
        setErrors({})

        try {
            switch (step) {
                case 0:
                    if (!form.userType.trim()) {
                        setErrors({ userType: "Please select an account type" })
                        return false
                    }
                    break

                case 1: {
                    const emailValue = form.email.trim()
                    if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
                        setErrors({ email: "Invalid email address" })
                        return false
                    }
                    break
                }

                case 2:
                    if (!form.password || form.password.length < 6) {
                        setErrors({ password: "Password must be at least 6 characters" })
                        return false
                    }
                    break

                case 3:
                    if (form.confirmPassword !== form.password) {
                        setErrors({ confirmPassword: "Passwords do not match" })
                        return false
                    }
                    break

                case 4:
                    if (form.userType === "company") {
                        if (!form.companyName.trim()) {
                            setErrors({ companyName: "Company name is required" })
                            return false
                        }
                    } else {
                        if (!form.fullName.trim()) {
                            setErrors({ fullName: "Full name is required" })
                            return false
                        }
                    }
                    break

                case 5:
                    if (!form.profession) {
                        setErrors({ profession: "Please select a profession" })
                        return false
                    }
                    break

                case 6:
                    if (form.userType === "company") {
                        if (!form.yearsActive) {
                            setErrors({ yearsActive: "Please select years active" })
                            return false
                        }
                    } else {
                        if (!form.educationLevel) {
                            setErrors({ educationLevel: "Please select an education level" })
                            return false
                        }
                    }
                    break

                case 7:
                    if (form.userType === "company") {
                        if (form.expertise.length === 0) {
                            setErrors({ expertise: "Include at least 1 expertise" })
                            return false
                        }
                        if (form.expertise.length > 5) {
                            setErrors({ expertise: "Maximum 5 expertise allowed" })
                            return false
                        }
                    } else {
                        if (form.skills.length === 0) {
                            setErrors({ skills: "Add at least 1 skill" })
                            return false
                        }
                        if (form.skills.length > 5) {
                            setErrors({ skills: "Maximum 5 skills allowed" })
                            return false
                        }
                    }
                    break

                default:
                    return true
            }
            return true
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const next = () => {
        if (validateCurrentStep()) {
            setStep((prev) => prev + 1);
        }
    }; 
	

	const back = () => setStep(step - 1)

	const jumpTo = (index: number) => {
		if (index <= step) setStep(index)
	}

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!validateCurrentStep()) {
			return
		}
		setIsLoading(true)

		try {
			const formData = new FormData()
			formData.append("email", form.email)
			formData.append("password", form.password)
			formData.append("fullName", form.userType === "company" ? form.companyName : form.fullName)
			formData.append("userType", form.userType)
			formData.append("profession", form.profession)

			const rawData = {
				email: formData.get("email") as string,
				password: formData.get("password") as string,
				fullName: formData.get("fullName") as string,
				userType: formData.get("userType") as string,
				profession: formData.get("profession") as string,
			}

			const validatedData = signUpSchema.parse(rawData)

			const supabaseSkills = validatedData.userType === "company"
				? form.expertise
				: form.skills

			const { data, error } = await signUp(validatedData.email, validatedData.password, {
				full_name: validatedData.fullName,
				user_type: validatedData.userType,
				profession: validatedData.profession,
				education_level: form.educationLevel || null,
				years_active: form.yearsActive || null,
				skills: supabaseSkills,
			})

			if (error) {
				toast({
					title: "Sign up failed",
					description: error.message,
					variant: "destructive",
				})
				return
			} else if (data.user?.identities?.length === 0) {
				toast({
					title: "Account exists",
					description: "You are already signed up. Please login",
					variant: "destructive",
				})
			} else {
				toast({
					title: "Account created!",
					description: "Please check your email to verify your account.",
				})
				localStorage.removeItem(STORAGE_KEY)
				showOtpModal(validatedData.email)
			}
		} catch (err) {
			if (err instanceof z.ZodError) {
				toast({
					title: "Validation Error",
					description: err.errors[0].message,
					variant: "destructive",
				})
			} else {
				toast({
					title: "Error",
					description: "An unexpected error occurred.",
					variant: "destructive",
				})
			}
		} finally {
			setIsLoading(false)
		}
	}

	const ErrorMessage = ({ field }: { field: string }) => {
		return errors[field] ? <p className="mt-1 text-sm text-red-500">{errors[field]}</p> : null
	}

	const slides = [
		// 0 — ACCOUNT TYPE
		<div key="type">
			<Label>Account Type</Label>
			<Select
				value={form.userType}
				onValueChange={(v) => {
					update("userType", v)
					setStep(1)
				}}>
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
					onClick={() => setShowPassword(!showPassword)}>
					{showPassword ? <EyeOff /> : <Eye />}
				</Button>
			</div>
			<ErrorMessage field="password" />
		</div>,

		// 3 — CONFIRM PASSWORD
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
					onClick={() => setShowPassword(!showPassword)}>
					{showPassword ? <EyeOff /> : <Eye />}
				</Button>
			</div>
			<ErrorMessage field="confirmPassword" />
		</div>,

		// 4 — NAME OR COMPANY NAME
		<div key="name">
			<Label>{form.userType === "company" ? "Company Name" : "Full Name"}</Label>
			<Input
				ref={inputRef}
				value={form.userType === "company" ? form.companyName : form.fullName}
				onChange={(e) => update(form.userType === "company" ? "companyName" : "fullName", e.target.value)}
				placeholder={form.userType === "company" ? "Enter company name" : "Enter your full name"}
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
					update("profession", v)
					setStep(6)
				}}>
				<SelectTrigger className={errors.profession ? "border-red-500" : ""}>
					<SelectValue placeholder="Select profession" />
				</SelectTrigger>
				<SelectContent>
					{(form.userType === "company" ? companyProfessionOptions : studentProfessionOptions).map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			<ErrorMessage field="profession" />
		</div>,

		// 6 — EDUCATION LEVEL OR YEARS ACTIVE
		form.userType === "company" ? (
			<div key="years">
				<Label>Years Active</Label>
				<Select
					value={form.yearsActive}
					onValueChange={(v) => {
						update("yearsActive", v)
						setStep(7)
					}}>
					<SelectTrigger className={errors.yearsActive ? "border-red-500" : ""}>
						<SelectValue placeholder="Select years active" />
					</SelectTrigger>
					<SelectContent>
						{companyYearsActive.map((range) => (
							<SelectItem key={range} value={range}>
								{range}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<ErrorMessage field="yearsActive" />
			</div>
		) : (
			<div key="education">
				<Label>Education Level</Label>
				<Select
					value={form.educationLevel}
					onValueChange={(v) => {
						update("educationLevel", v)
						setStep(7)
					}}>
					<SelectTrigger className={errors.educationLevel ? "border-red-500" : ""}>
						<SelectValue placeholder="Select level" />
					</SelectTrigger>
					<SelectContent>
						{studentEducationLevel.map((level) => (
							<SelectItem key={level} value={level}>
								{level}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<ErrorMessage field="educationLevel" />
			</div>
		),

		// 7 — SKILLS OR EXPERTISE
		form.userType === "company" ? (
			<div key="expertise">
				<Label>Expertise</Label>
				<SkillsAutocomplete
					options={expertiseByProfession[form.profession] || []}
					selected={form.expertise}
					onChange={(values) => setForm((prev) => ({ ...prev, expertise: values }))}
					max={5}
					placeholder="Search or type expertise..."
				/>
				<ErrorMessage field="expertise" />
			</div>
		) : (
			<div key="skills">
				<Label>Skills</Label>
				<SkillsAutocomplete
					options={skillsByProfession[form.profession] || []}
					selected={form.skills}
					onChange={(values) => setForm((prev) => ({ ...prev, skills: values }))}
					max={5}
					placeholder="Search or type a skill..."
				/>
				<ErrorMessage field="skills" />
			</div>
		),
	]

	const isFinal = step === slides.length - 1

	return (
		<Card>
			<CardHeader>
				<CardTitle>Create account</CardTitle>
				<CardDescription>Join our learning community today</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					<div className="flex items-center justify-center gap-3">
						{slides.map((_, i) => (
							<div
								key={i}
								onClick={() => jumpTo(i)}
								className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-sm transition-colors duration-300
                  ${i === step ? "bg-primary text-white transition" : i < step ? "bg-green-900 text-white" : "bg-muted"}
                `}>
								{i + 1}
							</div>
						))}
					</div>

					<div>{slides[step]}</div>

					<div className="flex justify-end pt-4">
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
	)
}

export default SignUpForm