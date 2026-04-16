import { useState } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { X } from "lucide-react"

interface SkillsAutocompleteProps {
    options: string[]
    selected: string[]
    onChange: (values: string[]) => void
    max?: number
    placeholder?: string
}

const SkillsAutocomplete = ({ options, selected, onChange, max = 5, placeholder = "Search or type a skill..." }: SkillsAutocompleteProps) => {
    const [input, setInput] = useState("")
    const [open, setOpen] = useState(false)

    const filtered = options.filter(
        (option) =>
        option.toLowerCase().includes(input.toLowerCase()) &&
        !selected.includes(option)
    )

    const addSkill = (skill: string) => {
        const trimmed = skill.trim()
        if (!trimmed || selected.includes(trimmed) || selected.length >= max) return
        
        onChange([...selected, trimmed])
        setInput("")
        setOpen(false)
    }

    const removeSkill = (skill: string) => {
        onChange(selected.filter((s) => s !== skill))
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && input.trim()) {
            e.preventDefault()
            addSkill(input)
        }
        if (e.key === "Backspace" && !input && selected.length > 0) {
            removeSkill(selected[selected.length - 1])
        }
    }

    return (
        <div className="space-y-2 relative">
            {/* Selected skill tags */}
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2">
                {selected.map((skill) => (
                    <span
                    key={skill}
                    className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                    {skill}
                    <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-destructive transition-colors">
                        <X size={14} />
                    </button>
                    </span>
                ))}
                </div>
            )}

            {/* Input with dropdown */}
            {selected.length < max && (
                <Command className="border rounded-md overflow-visible relative">
                    <CommandInput
                        value={input}
                        onFocus={() => setOpen(true)}
                        // The delay allows the click event on the item to fire before closing
                        onBlur={() => setTimeout(() => setOpen(false), 200)}
                        onValueChange={(val) => {
                            setInput(val)
                            setOpen(true)
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                    />
                    
                    {/* THE FIX: We hide it with CSS instead of destroying the component */}
                    <div className={`absolute top-full left-0 w-full z-50 mt-1 bg-popover border rounded-md shadow-md ${open ? "block" : "hidden"}`}>
                        <CommandList className="max-h-60 overflow-y-auto">
                            {/* Only show "Add custom" if they typed something */}
                            {input.trim() && (
                                <CommandEmpty
                                    onMouseDown={(e) => { e.preventDefault(); addSkill(input); }}
                                    className="cursor-pointer py-3 text-center text-sm hover:bg-accent">
                                    Add &quot;{input}&quot;
                                </CommandEmpty>
                            )}
                            <CommandGroup>
                                {filtered.map((option) => (
                                <CommandItem
                                    key={option}
                                    onSelect={() => addSkill(option)}
                                    className="cursor-pointer">
                                    {option}
                                </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </div>
                </Command>
            )}

            <p className="text-xs text-muted-foreground">
                {selected.length}/{max} selected
            </p>
        </div>
    )
}

export default SkillsAutocomplete