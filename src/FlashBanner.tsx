export default function FlashBanner({ text }: { text: string }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg">
      {text}
    </div>
  );
}
