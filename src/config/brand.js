import backgroundUrl from "@/assets/brand/background.png";
import hdfcErgoLogo from "@/assets/brand/hdfc-ergo.png";
import pioneersCircleLogo from "@/assets/brand/pioneers-circle.png";

export const brand = {
  eventName: "Pioneers Circle 2026",
  tagline: "Charting the Next Coordinate, Together!",
  logos: {
    event: {
      src: pioneersCircleLogo,
      alt: "Pioneers Circle 2026 — Viva la Colaboración",
    },
    company: { src: hdfcErgoLogo, alt: "HDFC ERGO" },
  },
  backgroundUrl,
};

export const copy = {
  register: {
    title: "Get your photos from the event",
    subtitle:
      "Register your selfie, and you can access all your photos after the event",
    note: "Powered by AI and face recognition",
    submit: "Register Now",
  },
  searching: {
    title: "Finding your photos",
    subtitle:
      "Matching your face across the event gallery. This process takes a few seconds.",
  },
  results: {
    title: "Your photos are ready",
    empty: "No photos matched yet",
    emptyHint:
      "Photos are still being uploaded from the event. Try again a little later, or re-register with a clearer selfie.",
  },
};
