"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  AVATAR_ALLOWED_MIME_TYPES,
  AVATAR_BUCKET,
  AVATAR_MAX_BYTES,
} from "@/lib/avatar";
import { isProfileCompleteForBooking } from "@/lib/profile/requirements";
import { safeNextPath } from "@/lib/profile/safe-next";

function extensionForMimeType(type: string): string {
  switch (type) {
    case "image/png":
      return "png";
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}

export async function uploadAvatarAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/profile");
  }

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    redirect("/profile?avatar_error=missing_file");
  }

  if (file.size > AVATAR_MAX_BYTES) {
    redirect("/profile?avatar_error=too_large");
  }

  if (
    !AVATAR_ALLOWED_MIME_TYPES.includes(
      file.type as (typeof AVATAR_ALLOWED_MIME_TYPES)[number],
    )
  ) {
    redirect("/profile?avatar_error=bad_type");
  }

  const ext = extensionForMimeType(file.type);
  const path = `${user.id}/avatar-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    redirect(
      `/profile?avatar_error=${encodeURIComponent(uploadError.message)}`,
    );
  }

  const { data: previousProfile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: path })
    .eq("id", user.id);

  if (updateError) {
    await supabase.storage.from(AVATAR_BUCKET).remove([path]);
    redirect(
      `/profile?avatar_error=${encodeURIComponent(updateError.message)}`,
    );
  }

  const previousPath = previousProfile?.avatar_url;
  if (previousPath && previousPath !== path) {
    await supabase.storage.from(AVATAR_BUCKET).remove([previousPath]);
  }

  revalidatePath("/", "layout");
  redirect("/profile?avatar_notice=updated");
}

export async function removeAvatarAction() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const previousPath = profile?.avatar_url;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);

  if (updateError) {
    redirect(
      `/profile?avatar_error=${encodeURIComponent(updateError.message)}`,
    );
  }

  if (previousPath) {
    await supabase.storage.from(AVATAR_BUCKET).remove([previousPath]);
  }

  revalidatePath("/", "layout");
  redirect("/profile?avatar_notice=removed");
}

const inputEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emptyToNull(value: string): string | null {
  const t = value.trim();
  return t === "" ? null : t;
}

export async function updateProfileAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/profile");
  }

  const display_name = emptyToNull(String(formData.get("display_name") ?? ""));
  const phone_number = emptyToNull(String(formData.get("phone_number") ?? ""));
  const address_line_1 = emptyToNull(String(formData.get("address_line_1") ?? ""));
  const address_line_2 = emptyToNull(String(formData.get("address_line_2") ?? ""));
  const post_code = emptyToNull(String(formData.get("post_code") ?? ""));

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name,
      phone_number,
      address_line_1,
      address_line_2,
      post_code,
    })
    .eq("id", user.id);

  if (error) {
    const nextQ = safeNextPath(formData.get("next"), "");
    const nextSuffix =
      nextQ !== "" ? `&next=${encodeURIComponent(nextQ)}` : "";
    redirect(
      `/profile?profile_error=${encodeURIComponent(error.message)}${nextSuffix}`,
    );
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard/book");

  const next = safeNextPath(formData.get("next"), "");
  const updated = {
    phone_number,
    address_line_1,
    post_code,
  };
  if (next && isProfileCompleteForBooking(updated)) {
    redirect(next);
  }

  const nextSuffix = next ? `&next=${encodeURIComponent(next)}` : "";
  redirect(`/profile?profile_notice=saved${nextSuffix}`);
}

export async function updateEmailAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/profile");
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email || !inputEmailPattern.test(email)) {
    redirect("/profile?credential_error=invalid_email");
  }

  if (email === user.email?.toLowerCase()) {
    redirect("/profile?credential_notice=email_unchanged");
  }

  const { error } = await supabase.auth.updateUser({ email });
  if (error) {
    redirect(
      `/profile?credential_error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/", "layout");
  redirect("/profile?credential_notice=email_updated");
}

export async function updatePasswordAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/profile");
  }

  const newPassword = String(formData.get("new_password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!newPassword) {
    redirect("/profile?credential_error=password_required");
  }
  if (newPassword.length < 6) {
    redirect("/profile?credential_error=password_short");
  }
  if (newPassword !== confirmPassword) {
    redirect("/profile?credential_error=password_mismatch");
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    redirect(
      `/profile?credential_error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/", "layout");
  redirect("/profile?credential_notice=password_updated");
}
