export type PostStatus = "industry" | "project" | "opportunity";

export const POST_STATUS_PLACEHOLDERS: Record<PostStatus, string> = {
  industry: "Share your thoughts, insights or questions",
  project: "Display & highlight your work",
  opportunity: "Post gigs, job openings & any other opportunities",
};
