export default function MaintenancePage() {
  return (
    <div
      dir="rtl"
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-4"
    >
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🔧</div>
        <h1 className="text-3xl font-bold mb-3">الموقع تحت الصيانة</h1>
        <p className="text-slate-400 text-lg mb-2">
          نعمل على تحسين تجربتك، سنعود قريبًا!
        </p>
        <p className="text-slate-500 text-sm">
          We&apos;ll be back soon. Thank you for your patience.
        </p>
      </div>
    </div>
  );
}
