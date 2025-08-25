"use client";

import { useCallback, useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  CharacterCounter,
  buildSmsPreview,
} from "@/components/sms/CharacterCounter";
import { VariableInserter } from "@/components/campaigns/VariableInserter";
import { PhonePreview } from "@/components/sms/PhonePreview";
import { SenderIdInput } from "@/components/sms/SenderIdInput";
import { Button } from "@/components/ui/button";

type MessageComposerProps = {
  initialText?: string;
};

function generatePlaceholderToken(length = 10) {
  return "x".repeat(length);
}

export function MessageComposer({ initialText = "" }: MessageComposerProps) {
  const [text, setText] = useState(initialText);
  const [token] = useState(generatePlaceholderToken());
  const [sender, setSender] = useState("");

  const insertVariable = useCallback((variable: string) => {
    setText((prev) => prev + variable);
  }, []);

  const preview = useMemo(() => buildSmsPreview(text, token), [text, token]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <label className="text-sm font-medium">Meddelande</label>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Hej {first_name}, missa inte vårt erbjudande!"}
          rows={10}
        />
        <SenderIdInput value={sender} onChange={setSender} />
        <CharacterCounter message={text} />
        <VariableInserter onInsert={insertVariable} />
        <EmojiPicker onInsert={(e) => setText((prev) => prev + e)} />
        <div className="text-xs text-muted-foreground">
          Avregistreringslänken läggs automatiskt till och kan inte tas bort.
        </div>
      </div>
      <div>
        <div className="text-sm font-medium mb-2">Förhandsvisning</div>
        <PhonePreview text={preview} senderId={sender || "Sendio"} />
      </div>
    </div>
  );
}

type EmojiPickerProps = { onInsert: (emoji: string) => void };
const COMMON_EMOJIS = [
  "😀",
  "😁",
  "😂",
  "😅",
  "😊",
  "😍",
  "😎",
  "👍",
  "🔥",
  "🎉",
  "⭐",
  "💡",
  "✅",
  "💪",
  "📣",
  "🛒",
  "⏰",
  "📅",
  "🎁",
  "✨",
];
function EmojiPicker({ onInsert }: EmojiPickerProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground">Infoga emoji</div>
      <div className="flex flex-wrap gap-2">
        {COMMON_EMOJIS.map((e) => (
          <Button
            key={e}
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onInsert(e)}
          >
            {e}
          </Button>
        ))}
      </div>
    </div>
  );
}
