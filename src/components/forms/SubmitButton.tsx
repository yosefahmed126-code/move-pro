interface Props {
  loading: boolean;
  text: string;
  loadingText?: string;
}

export default function SubmitButton({
  loading,
  text,
  loadingText = "Saving...",
}: Props) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="rounded-lg bg-cyan-600 px-6 py-3 text-white transition hover:bg-cyan-700 disabled:opacity-50"
    >
      {loading ? loadingText : text}
    </button>
  );
}