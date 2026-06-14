import Image from 'next/image';
import type {ProjectVariant} from '@/config/projects';

type Props = {
  variant: ProjectVariant;
  /** Layout variation for gallery variety. */
  view?: 'a' | 'b';
  device?: 'browser' | 'phone';
  /** Real screenshot path — overrides the generated mockup when provided. */
  src?: string;
  alt?: string;
  className?: string;
};

// A purely decorative, on-brand fake UI used as a screenshot placeholder.
// Looks intentional and ships zero binary assets, so the static build stays clean.
export default function ProjectMockup({
  variant,
  view = 'a',
  device = 'browser',
  src,
  alt = '',
  className = ''
}: Props) {
  const screen = src ? (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      className="object-cover object-top"
    />
  ) : (
    <Body variant={variant} view={view} />
  );

  if (device === 'phone') {
    return (
      <div
        aria-hidden={!src}
        className={`mx-auto w-full max-w-[220px] rounded-[2rem] border-[6px] border-gray-900 bg-gray-900 shadow-xl ${className}`}
      >
        <div className="relative aspect-[9/19] overflow-hidden rounded-[1.5rem] bg-white">
          <div className="absolute left-1/2 top-2 z-10 h-1.5 w-12 -translate-x-1/2 rounded-full bg-gray-900/80" />
          {screen}
        </div>
      </div>
    );
  }

  return (
    <div
      aria-hidden={!src}
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-gray-100 bg-gray-50 px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
        <div className="ml-3 h-4 w-1/2 rounded bg-white ring-1 ring-gray-100" />
      </div>
      <div className="relative aspect-[16/10] overflow-hidden bg-white">{screen}</div>
    </div>
  );
}

function Body({variant, view}: {variant: ProjectVariant; view: 'a' | 'b'}) {
  if (variant === 'dashboard') return <Dashboard view={view} />;
  if (variant === 'landing') return <Landing view={view} />;
  return <AppView view={view} />;
}

const bar = (w: string, c = 'bg-gray-200') => (
  <div className={`h-2 rounded-full ${c}`} style={{width: w}} />
);

function Dashboard({view}: {view: 'a' | 'b'}) {
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="hidden w-1/5 flex-col gap-3 border-r border-gray-100 bg-gray-50 p-3 sm:flex">
        <div className="h-3 w-3 rounded-full bg-brand" />
        {bar('80%')}
        {bar('60%', 'bg-brand-100')}
        {bar('70%')}
        {bar('50%')}
      </div>
      {/* Main */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          {bar('30%', 'bg-gray-300')}
          <div className="h-5 w-16 rounded-md bg-brand" />
        </div>
        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`flex flex-col gap-1.5 rounded-lg border border-gray-100 p-2 ${
                (view === 'a' ? i === 0 : i === 2) ? 'bg-brand-50' : 'bg-white'
              }`}
            >
              {bar('60%')}
              <div
                className={`h-3 w-1/2 rounded ${
                  (view === 'a' ? i === 0 : i === 2) ? 'bg-brand' : 'bg-gray-300'
                }`}
              />
            </div>
          ))}
        </div>
        {/* Chart */}
        <div className="flex flex-1 items-end gap-2 rounded-lg border border-gray-100 p-3">
          {[40, 65, 50, 80, 55, 70, 45].map((h, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t ${i % 3 === 1 ? 'bg-brand' : 'bg-brand-100'}`}
              style={{height: `${h}%`}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Landing({view}: {view: 'a' | 'b'}) {
  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-brand" />
        <div className="flex gap-3">
          {bar('24px')}
          {bar('24px')}
          {bar('24px')}
        </div>
      </div>
      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-6 text-center">
        <div className="h-4 w-20 rounded-full bg-brand-50" />
        <div className="h-3.5 w-3/4 rounded-full bg-gray-800" />
        <div className="h-3.5 w-2/3 rounded-full bg-gray-800" />
        <div className="mt-1 flex gap-2">
          <div className="h-6 w-20 rounded-lg bg-brand" />
          <div className="h-6 w-20 rounded-lg border border-gray-200" />
        </div>
      </div>
      {/* Feature row */}
      <div className="grid grid-cols-3 gap-2 p-4">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="flex flex-col items-center gap-1.5 rounded-lg border border-gray-100 p-2"
          >
            <div
              className={`h-5 w-5 rounded-md ${
                (view === 'a' ? i === 1 : i === 0) ? 'bg-brand' : 'bg-brand-100'
              }`}
            />
            {bar('70%')}
          </div>
        ))}
      </div>
    </div>
  );
}

function AppView({view}: {view: 'a' | 'b'}) {
  return (
    <div className="flex h-full flex-col">
      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-100 px-4 py-3">
        <div className="h-2.5 w-16 rounded-full bg-brand" />
        {bar('40px')}
        {bar('40px')}
      </div>
      <div className="flex flex-1">
        {/* List */}
        <div className="flex flex-1 flex-col gap-2 p-3">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg border border-gray-100 p-2"
            >
              <div
                className={`h-6 w-6 shrink-0 rounded-full ${
                  i % 2 === 0 ? 'bg-brand-50' : 'bg-gray-100'
                }`}
              />
              <div className="flex flex-1 flex-col gap-1">
                {bar('70%')}
                {bar('40%')}
              </div>
              <div
                className={`h-4 w-10 rounded-full ${
                  (view === 'a' ? i === 0 : i === 1) ? 'bg-brand' : 'bg-brand-100'
                }`}
              />
            </div>
          ))}
        </div>
        {/* Detail panel */}
        <div className="hidden w-1/3 flex-col gap-2 border-l border-gray-100 bg-gray-50 p-3 sm:flex">
          <div className="h-10 w-10 rounded-full bg-brand-100" />
          {bar('80%')}
          {bar('60%')}
          <div className="mt-2 h-6 w-full rounded-md bg-brand" />
        </div>
      </div>
    </div>
  );
}
