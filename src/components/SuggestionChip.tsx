interface SuggestionChipProps {
  label: string;
  onClick: () => void;
}

const SuggestionChip = ({ label, onClick }: SuggestionChipProps) => (
  <button
    onClick={onClick}
    className="text-sm px-4 py-2 rounded-full border border-border bg-card text-foreground hover:bg-accent hover:border-primary/30 transition-all duration-200 text-left"
  >
    {label}
  </button>
);

export default SuggestionChip;
