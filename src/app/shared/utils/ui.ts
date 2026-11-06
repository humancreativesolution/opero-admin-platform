export const ui = {
  label: 'text-sm font-medium text-slate-700',
  input:
    'flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-60',
  textarea:
    'flex min-h-20 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
  select:
    'flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60',
  fieldError: 'text-xs text-red-600',
  formError: 'p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600',
  btnPrimary:
    'inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  btnSecondary:
    'inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  btnDanger:
    'inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
  btnGhost:
    'inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed',
  card: 'bg-white border border-slate-200 rounded-xl shadow-xs',
  th: 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500',
  td: 'px-4 py-3 text-sm text-slate-700 align-middle',
} as const;

export const badgeClass: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  SUSPENDED: 'bg-amber-50 text-amber-700 border-amber-200',
  ARCHIVED: 'bg-slate-100 text-slate-600 border-slate-200',
  INACTIVE: 'bg-slate-100 text-slate-600 border-slate-200',
  SUPER_ADMIN: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  SUPPORT: 'bg-sky-50 text-sky-700 border-sky-200',
  BILLING: 'bg-violet-50 text-violet-700 border-violet-200',
};

export const badgeBase =
  'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide';
