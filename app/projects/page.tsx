import { redirect } from "next/navigation";

// Projects now live on each learner's card at /portfolio/learners
export default function ProjectsPage({ searchParams }: { searchParams: { cohort?: string } }) {
  redirect(searchParams.cohort ? `/portfolio/learners?cohort=${encodeURIComponent(searchParams.cohort)}` : "/portfolio/learners");
}
