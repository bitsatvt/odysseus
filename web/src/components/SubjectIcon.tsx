export default function SubjectIcon({ subject, className }: { subject: string; className?: string }) {
  const normalizedSubject = subject.toUpperCase();
  if (normalizedSubject !== "CS" && normalizedSubject !== "ECE") return null;

  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {normalizedSubject === "CS" ? <path d="M8 3C5 3 5 5 5 7v2c0 2-1 3-3 3 2 0 3 1 3 3v2c0 2 0 4 3 4M16 3c3 0 3 2 3 4v2c0 2 1 3 3 3-2 0-3 1-3 3v2c0 2 0 4-3 4" />
        : <><path d="M4 4h5a3 3 0 0 1 0 6H7a4 4 0 0 0 0 8h5m0-4v8m4-7v6m0-4h3m-3 3h3" /><circle cx="4" cy="4" r="1" /></>}
    </svg>
  );
}
