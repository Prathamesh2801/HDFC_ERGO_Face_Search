import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { SelfieField } from "@/components/form/SelfieField";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { copy } from "@/config/brand";
import { useSearch } from "@/store/searchContext";
import { validateImage } from "@/utils/file";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { startSearch, reset } = useSearch();

  const [fullName, setFullName] = useState("");
  const [selfie, setSelfie] = useState(null);
  const [errors, setErrors] = useState({});

  // A local preview URL so the field can show the shot before we submit it.
  const previewUrl = useMemo(
    () => (selfie ? URL.createObjectURL(selfie) : null),
    [selfie]
  );
  useEffect(
    () => () => previewUrl && URL.revokeObjectURL(previewUrl),
    [previewUrl]
  );

  // Returning here from the results screen starts a clean run.
  useEffect(() => reset, [reset]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {
      fullName:
        fullName.trim().length < 2 ? "Please enter your full name." : null,
      selfie: validateImage(selfie),
    };
    setErrors(nextErrors);
    if (nextErrors.fullName || nextErrors.selfie) return;

    startSearch({ fullName, selfie });
    navigate("/searching");
  };

  return (
    <div className="flex flex-1 animate-fade-up flex-col">
      <section className="pt-2 text-center">
        <h1 className="text-3xl leading-tight font-bold tracking-tight text-brand-600 uppercase sm:text-4xl">
          {copy.register.title}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-600 sm:text-lg">
          {copy.register.subtitle}
        </p>
        <p className="mt-3 text-base font-medium text-ink-500 sm:text-lg">
          {copy.register.note}
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-8 space-y-6 sm:mt-10"
      >
        <TextField
          label="Full Name"
          name="fullName"
          autoComplete="name"
          enterKeyHint="done"
          placeholder="e.g. Ananya Sharma"
          value={fullName}
          onChange={(event) => {
            setFullName(event.target.value);
            if (errors.fullName)
              setErrors((prev) => ({ ...prev, fullName: null }));
          }}
          error={errors.fullName}
        />

        <SelfieField
          label="Upload Headshot/Selfie"
          value={selfie}
          previewUrl={previewUrl}
          error={errors.selfie}
          onChange={(file) => {
            setSelfie(file);
            setErrors((prev) => ({ ...prev, selfie: null }));
          }}
        />

        <div className="pt-2 text-center">
          <Button type="submit" className="min-w-56 text-lg uppercase">
            {copy.register.submit}
          </Button>
        </div>
      </form>
    </div>
  );
}
