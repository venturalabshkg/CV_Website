"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveProfile } from "@/actions/content";
import { Field, controlClass } from "@/components/admin/nav";
import { ImageField } from "@/components/admin/image-field";

type ProfileData = {
  fullName: string;
  initials: string;
  title: string;
  introduction: string;
  about: string;
  location: string;
  timezone: string;
  availability: string;
  email: string;
  avatarUrl: string;
  resumeUrl: string;
  githubUsername: string;
  linkedinUrl: string;
  availableForWork: boolean;
};

export function ProfileForm({ profile }: { profile: ProfileData }) {
  const [pending, start] = useTransition();
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [resumeUrl, setResumeUrl] = useState(profile.resumeUrl);

  return (
    <form
      className="grid max-w-3xl gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        start(async () => {
          const result = await saveProfile({
            fullName: form.get("fullName"),
            initials: form.get("initials"),
            title: form.get("title"),
            introduction: form.get("introduction"),
            about: form.get("about"),
            location: form.get("location"),
            timezone: form.get("timezone"),
            availability: form.get("availability"),
            email: form.get("email"),
            avatarUrl,
            resumeUrl,
            githubUsername: form.get("githubUsername"),
            linkedinUrl: form.get("linkedinUrl"),
            availableForWork: form.get("availableForWork") === "on",
          });
          if (!result.ok) toast.error(result.error);
          else toast.success("Profile saved.");
        });
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name"><input name="fullName" defaultValue={profile.fullName} className={controlClass} required /></Field>
        <Field label="Initials"><input name="initials" defaultValue={profile.initials} maxLength={4} className={controlClass} required /></Field>
      </div>
      <Field label="Professional title"><input name="title" defaultValue={profile.title} className={controlClass} required /></Field>
      <Field label="Short introduction"><textarea name="introduction" defaultValue={profile.introduction} rows={4} className={controlClass} required /></Field>
      <Field label="About"><textarea name="about" defaultValue={profile.about} rows={10} className={controlClass} /></Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Location"><input name="location" defaultValue={profile.location} className={controlClass} /></Field>
        <Field label="Timezone"><input name="timezone" defaultValue={profile.timezone} className={controlClass} placeholder="America/New_York" required /></Field>
        <Field label="Availability"><input name="availability" defaultValue={profile.availability} className={controlClass} /></Field>
        <Field label="Email"><input name="email" type="email" defaultValue={profile.email} className={controlClass} required /></Field>
        <Field label="GitHub username"><input name="githubUsername" defaultValue={profile.githubUsername} className={controlClass} /></Field>
        <Field label="LinkedIn URL"><input name="linkedinUrl" defaultValue={profile.linkedinUrl} className={controlClass} /></Field>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input name="availableForWork" type="checkbox" defaultChecked={profile.availableForWork} />
        Available for work
      </label>
      <ImageField label="Profile picture" value={avatarUrl} onChange={setAvatarUrl} />
      <ImageField label="Resume" value={resumeUrl} onChange={setResumeUrl} accept="image/png,image/jpeg,image/webp,application/pdf" />
      <div className="flex gap-2">
        <button disabled={pending} className="on-fg px-4 py-2 text-sm disabled:opacity-60">{pending ? "Saving…" : "Save profile"}</button>
      </div>
    </form>
  );
}
