"use client";

type PhonePreviewProps = {
  text: string;
  senderId?: string;
};

export function PhonePreview({ text, senderId }: PhonePreviewProps) {
  return (
    <div className="w-full max-w-xs mx-auto">
      <div
        className="rounded-[2.25rem] border bg-white text-black shadow-xl relative overflow-hidden"
        style={{ height: 420 }}
      >
        {/* Dynamic Island */}
        <div className="absolute left-1/2 -translate-x-1/2 top-3 h-8 w-32 bg-black rounded-full" />
        {/* Status bar mock */}
        <div className="flex items-center justify-between px-5 pt-3 text-[10px] text-gray-600">
          <span>09:41</span>
          <span>LTE • 100%</span>
        </div>
        {/* Header */}
        <div className="px-5 pt-8 pb-3 border-b border-black/10 text-center">
          <div className="text-[11px] text-gray-500">SMS</div>
          <div className="text-sm font-semibold tracking-wide">
            {senderId || "Avsändare"}
          </div>
        </div>
        {/* Body */}
        <div className="p-4 h-full overflow-auto bg-[#F5F5F7]">
          <div className="bg-white text-gray-900 rounded-2xl p-3 text-sm whitespace-pre-wrap break-words max-w-[85%] shadow-sm border border-black/5">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
}
