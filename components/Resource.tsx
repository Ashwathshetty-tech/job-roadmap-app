import ResourceLink from "@/components/ResourceLink";
import { Mic, Users, FileText, DollarSign, Code2 } from "lucide-react";

const resources = [
  {
    icon: Mic,
    title: "Mock interviews — AI",
    description:
      "Practice coding, system design, and behavioral rounds with a live AI interviewer.",
    linkLabel: "Try DevInterview.AI (first interview free)",
    url: "https://devinterview.ai",
  },
  {
    icon: Users,
    title: "Mock interviews — free peer practice",
    description:
      "Interview a peer, then have them interview you — completely free, no card, unlimited sessions.",
    linkLabel: "Try Pramp (via Exponent)",
    url: "https://www.tryexponent.com/practice",
  },
  {
    icon: FileText,
    title: "Resume + application tracker",
    description:
      "Free resume builder with ATS scoring, plus a built-in tracker for saved/applied/interviewing stages.",
    linkLabel: "Try Teal",
    url: "https://www.tealhq.com",
  },
  {
    icon: DollarSign,
    title: "Salary research",
    description:
      "Real, crowdsourced tech compensation data by company, role, and level — useful before any negotiation.",
    linkLabel: "Check Levels.fyi",
    url: "https://www.levels.fyi",
  },
  {
    icon: Code2,
    title: "Coding practice",
    description:
      "Free, curated problem lists (Blind 75, NeetCode 150) with free video explanations for each one.",
    linkLabel: "Practice on NeetCode",
    url: "https://neetcode.io",
  },
];

export default function Resources() {
  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-3xl font-medium text-text mb-2">Resources</h1>
      <p className="text-textDim text-sm mb-8 max-w-md">
        A short list of external tools worth using alongside your roadmap. We
        don't run these ourselves — just tools we think are genuinely useful.
      </p>

      {resources.map((r) => (
        <div key={r.title} className="bg-surface border border-border rounded-md p-5 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <r.icon size={16} className="text-accent" />
            <div className="text-sm text-text font-medium">{r.title}</div>
          </div>
          <p className="text-sm text-textDim mb-1">{r.description}</p>
          <ResourceLink label={r.linkLabel} url={r.url} />
        </div>
      ))}

      <p className="text-xs text-textDim mt-6">
        We're not affiliated with any of these tools — they're just ones we've
        found useful. More will be added over time.
      </p>
    </div>
  );
}
