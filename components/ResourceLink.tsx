import { ExternalLink } from "lucide-react";

export default function ResourceLink({
  label,
  url,
}: {
  label: string;
  url: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accentStrong mt-3"
    >
      {label} <ExternalLink size={11} />
    </a>
  );
}
