/* -------------------------------------------------------------------------- */
/*  PageHeader — consistent page title with liturgical signature              */
/*                                                                             */
/*  The gold rule mimics the silk ribbon bookmark in a breviary —              */
/*  it fades from gold to transparent and back. Each page gets the same        */
/*  treatment so it becomes the parish brand, not a per-page decoration.      */
/* -------------------------------------------------------------------------- */

interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8 md:mb-10">
      {/* Eyebrow — small label, disciplined spacing */}
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-amber-700/70">
        Paroki Sandai
      </p>

      {/* Title — serif display, generous size */}
      <h1 className="font-serif text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
        {title}
      </h1>

      {/* Description — one line, quiet */}
      {description && (
        <p className="mt-2 text-sm text-slate-500 md:text-base">
          {description}
        </p>
      )}

      {/* Signature: liturgical ribbon — gold → transparent → gold */}
      <div className="mt-5 flex items-center gap-2">
        {/* Left fade */}
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-400/50 to-amber-400/30" />
        {/* Center dot — like a seal / host */}
        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/70" />
        {/* Right fade */}
        <div className="h-px flex-1 bg-gradient-to-r from-amber-400/30 via-amber-400/50 to-transparent" />
      </div>
    </div>
  );
}
