import { JackpotCounter } from "./JackpotCounter";

export default function JackpotPopup() {
  // مؤقتًا، بعدين نربطه بالـ state أو backend
  const jackpotAmount = 12345.67;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <JackpotCounter amount={jackpotAmount} />
    </div>
  );
}
