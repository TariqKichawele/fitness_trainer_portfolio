import { BOOK_PROFILE_NEXT } from "@/lib/profile/requirements";

export function bookSessionHref(isLoggedIn: boolean): string {
  return isLoggedIn
    ? BOOK_PROFILE_NEXT
    : `/login?next=${encodeURIComponent(BOOK_PROFILE_NEXT)}`;
}

export function bookSessionLabel(isLoggedIn: boolean, isFull: boolean): string {
  if (isFull) return "Full";
  return isLoggedIn ? "Book now" : "Sign in to book";
}
