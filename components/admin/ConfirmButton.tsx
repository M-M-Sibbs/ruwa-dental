"use client";
// A submit button that asks before a destructive action.
export function ConfirmButton({
  message,
  children,
  className = "text-sm font-semibold text-danger hover:underline",
}: {
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
