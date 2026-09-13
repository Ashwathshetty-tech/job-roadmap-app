type Props = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "empty" | "error";
};

export default function StateMessage({ title, description, actionLabel, onAction, tone = "empty" }: Props) {
  return (
    <div
      className="rounded-md border px-6 py-8 text-center"
      style={{
        borderColor: tone === "error" ? "#C9706633" : "#2E363D",
        background: tone === "error" ? "rgba(201,112,102,0.06)" : "#1B2126",
      }}
    >
      <div className="font-serif text-lg text-text mb-1.5">{title}</div>
      {description && <p className="text-sm text-textDim mb-4 max-w-sm mx-auto">{description}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="text-sm text-accent underline">
          {actionLabel}
        </button>
      )}
    </div>
  );
}