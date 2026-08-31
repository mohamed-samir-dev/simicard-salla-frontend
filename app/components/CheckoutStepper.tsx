"use client";

import { IoCartOutline, IoCardOutline, IoCheckmarkCircleOutline, IoCheckmarkSharp } from "react-icons/io5";

const steps = [
  { key: "cart", label: "السلة", icon: IoCartOutline },
  { key: "payment", label: "الدفع", icon: IoCardOutline },
  { key: "confirm", label: "التأكيد", icon: IoCheckmarkCircleOutline },
];

export default function CheckoutStepper({ active }: { active: "cart" | "payment" | "confirm" }) {
  const activeIdx = steps.findIndex((s) => s.key === active);

  return (
    <div className="flex items-center justify-center py-4 sm:py-5" dir="rtl">
      {steps.map((step, i) => {
        const done = i < activeIdx;
        const current = i === activeIdx;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all duration-300"
                style={
                  current
                    ? { background: "linear-gradient(135deg,#47A557,#129928)", color: "#ffffff", boxShadow: "0 4px 14px rgba(71,165,87,0.3)" }
                    : done
                    ? { background: "linear-gradient(135deg,#47A557,#129928)", color: "#ffffff" }
                    : { background: "#DCEFE8", border: "1px solid rgba(128,199,141,0.4)", color: "rgba(26,46,68,0.3)" }
                }
              >
                {done ? <IoCheckmarkSharp size={20} /> : <Icon size={current ? 21 : 19} />}
              </div>
              <span
                className="text-[11px] sm:text-xs font-bold transition-colors"
                style={{ color: current ? "#47A557" : done ? "#47A557" : "rgba(26,46,68,0.3)" }}
              >
                {step.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className="w-12 sm:w-20 h-0.5 rounded-full mx-2 sm:mx-3 mb-5 transition-all duration-300"
                style={{ background: i < activeIdx ? "linear-gradient(to left,#47A557,#80C78D)" : "rgba(128,199,141,0.3)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
