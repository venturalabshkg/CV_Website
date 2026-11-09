import { getProfile } from "@/lib/queries";
import { AdminHeader } from "@/components/admin/nav";
import { ProfileForm } from "@/components/admin/profile-form";

export default async function ProfilePage() {
  const profile = await getProfile();
  if (!profile) return <p>Run npm run setup before editing the profile.</p>;

  return (
    <div>
      <AdminHeader title="Profile" text="This content appears in the introduction, about section, footer, and command palette." />
      <ProfileForm
        profile={{
          fullName: profile.fullName,
          initials: profile.initials,
          title: profile.title,
          introduction: profile.introduction,
          about: profile.about,
          location: profile.location,
          timezone: profile.timezone,
          availability: profile.availability,
          email: profile.email,
          avatarUrl: profile.avatarUrl || "",
          resumeUrl: profile.resumeUrl || "",
          githubUsername: profile.githubUsername || "",
          linkedinUrl: profile.linkedinUrl || "",
          availableForWork: profile.availableForWork,
        }}
      />
    </div>
  );
}
