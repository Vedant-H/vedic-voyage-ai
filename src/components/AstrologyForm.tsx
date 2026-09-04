import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Sparkles, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INTEREST_OPTIONS, type BirthDetails } from "@/types/astrology";

type FormErrors = {
  dateOfBirth?: string;
  timeOfBirth?: string;
  birthCity?: string;
  birthCountry?: string;
  interests?: string;
};

const STEPS = ["Personal details", "Birth details", "Your focus"];

interface Props {
  onSubmit: (details: BirthDetails) => void;
  submitting?: boolean;
}

export function AstrologyForm({ onSubmit, submitting = false }: Props) {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState<BirthDetails>({
    name: "",
    dateOfBirth: "",
    timeOfBirth: "",
    birthCity: "",
    birthState: "",
    birthCountry: "",
    currentLocation: "",
    gender: "",
    interests: [],
  });

  const set = (key: keyof BirthDetails, value: string | string[]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function validate(current: number) {
    const next: FormErrors = {};
    if (current === 0 && !form.dateOfBirth) next.dateOfBirth = "Please enter your date of birth.";
    if (current === 1) {
      if (!form.timeOfBirth) next.timeOfBirth = "Please enter your time of birth.";
      if (!form.birthCity.trim()) next.birthCity = "Please enter your birth city.";
      if (!form.birthCountry.trim()) next.birthCountry = "Please enter your birth country.";
    }
    if (current === 2 && form.interests.length === 0)
      next.interests = "Select at least one area to explore.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function next() {
    if (!validate(step)) return;
    if (step < 2) setStep(step + 1);
    else onSubmit({ ...form, name: form.name.trim() });
  }

  const toggleInterest = (value: string) =>
    set(
      "interests",
      form.interests.includes(value)
        ? form.interests.filter((i) => i !== value)
        : [...form.interests, value],
    );

  return (
    <div className="glass-panel mx-auto w-full max-w-2xl rounded-3xl p-6 sm:p-9">
      <ol className="mb-8 flex items-center gap-2" aria-label="Form progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 flex-col gap-2">
            <div
              className={`h-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-border"}`}
              aria-hidden="true"
            />
            <span
              className={`text-[11px] uppercase tracking-widest ${
                i === step ? "text-foreground" : "text-muted-foreground"
              }`}
              aria-current={i === step ? "step" : undefined}
            >
              {String(i + 1).padStart(2, "0")} {label}
            </span>
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28 }}
          className="space-y-5"
        >
          {step === 0 && (
            <>
              <Field label="Full name" hint="Optional" id="name">
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Ananya Sharma"
                  autoComplete="name"
                />
              </Field>
              <Field label="Date of birth" id="dob" error={errors.dateOfBirth}>
                <Input
                  id="dob"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => set("dateOfBirth", e.target.value)}
                  aria-invalid={Boolean(errors.dateOfBirth)}
                  aria-describedby={errors.dateOfBirth ? "dob-error" : undefined}
                />
              </Field>
              <Field label="Gender" hint="Optional" id="gender">
                <div className="flex flex-wrap gap-2">
                  {["Female", "Male", "Non-binary", "Prefer not to say"].map((g) => (
                    <Chip
                      key={g}
                      active={form.gender === g}
                      onClick={() => set("gender", form.gender === g ? "" : g)}
                    >
                      {g}
                    </Chip>
                  ))}
                </div>
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field label="Time of birth" id="tob" error={errors.timeOfBirth}>
                <Input
                  id="tob"
                  type="time"
                  value={form.timeOfBirth}
                  onChange={(e) => set("timeOfBirth", e.target.value)}
                  aria-invalid={Boolean(errors.timeOfBirth)}
                />
              </Field>
              <p className="text-xs leading-relaxed text-muted-foreground">
                The accuracy of traditional birth-chart calculations can depend on the accuracy of
                your recorded birth time.
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Birth city" id="city" error={errors.birthCity}>
                  <Input
                    id="city"
                    value={form.birthCity}
                    onChange={(e) => set("birthCity", e.target.value)}
                    placeholder="Jaipur"
                  />
                </Field>
                <Field label="Birth state / region" hint="Optional" id="state">
                  <Input
                    id="state"
                    value={form.birthState}
                    onChange={(e) => set("birthState", e.target.value)}
                    placeholder="Rajasthan"
                  />
                </Field>
                <Field label="Birth country" id="country" error={errors.birthCountry}>
                  <Input
                    id="country"
                    value={form.birthCountry}
                    onChange={(e) => set("birthCountry", e.target.value)}
                    placeholder="India"
                  />
                </Field>
                <Field label="Current city / country" hint="Optional" id="current">
                  <Input
                    id="current"
                    value={form.currentLocation}
                    onChange={(e) => set("currentLocation", e.target.value)}
                    placeholder="Berlin, Germany"
                  />
                </Field>
              </div>
            </>
          )}

          {step === 2 && (
            <fieldset>
              <legend className="mb-1 text-sm font-medium">
                What would you like explored most?
              </legend>
              <p className="mb-4 text-xs text-muted-foreground">Select one or more.</p>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((option) => (
                  <Chip
                    key={option}
                    active={form.interests.includes(option)}
                    onClick={() => toggleInterest(option)}
                  >
                    {form.interests.includes(option) && (
                      <Check className="mr-1.5 inline size-3.5" aria-hidden="true" />
                    )}
                    {option}
                  </Chip>
                ))}
              </div>
              {errors.interests && (
                <p role="alert" className="mt-3 text-xs text-destructive">
                  {errors.interests}
                </p>
              )}
            </fieldset>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0 || submitting}
          className="text-muted-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back
        </Button>
        <Button type="button" onClick={next} disabled={submitting} size="lg" className="min-w-40">
          {step === 2 ? (
            <>
              <Sparkles className="size-4" aria-hidden="true" /> Generate my reading
            </>
          ) : (
            <>
              Continue <ArrowRight className="size-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Lock className="size-3.5" aria-hidden="true" />
        Your birth details are used only to generate this reading.
      </p>
    </div>
  );
}

function Field({
  label,
  id,
  hint,
  error,
  children,
}: {
  label: string;
  id: string;
  hint?: string | undefined;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <Label htmlFor={id}>{label}</Label>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-sm transition-all ${
        active
          ? "border-primary/60 bg-primary/15 text-foreground glow-ring"
          : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
