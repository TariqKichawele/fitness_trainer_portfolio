export type ProfileBookingFields = {
  phone_number: string | null;
  address_line_1: string | null;
  post_code: string | null;
};

export function isProfileCompleteForBooking(
  profile: ProfileBookingFields | null | undefined,
): boolean {
  if (!profile) return false;
  return (
    Boolean(profile.phone_number?.trim()) &&
    Boolean(profile.address_line_1?.trim()) &&
    Boolean(profile.post_code?.trim())
  );
}

export function profileBookingMissingFields(
  profile: ProfileBookingFields | null | undefined,
): string[] {
  const missing: string[] = [];
  if (!profile?.phone_number?.trim()) missing.push("phone number");
  if (!profile?.address_line_1?.trim()) missing.push("address line 1");
  if (!profile?.post_code?.trim()) missing.push("post code");
  return missing;
}

export const BOOK_PROFILE_NEXT = "/dashboard/book";
