import Editor, { OnChange } from '@monaco-editor/react';

interface RoomEditorProps {
    code: string;
    onChange: (value: string | undefined) => void;
    language?: string;
    theme?: string;
}

export function RoomEditor({ code, onChange, language = "javascript", theme = "vs-dark" }: RoomEditorProps) {
    return (
        <div className="relative h-full w-full rounded-xl overflow-hidden border border-white/5 shadow-2xl bg-[#1e1e1e]">
          <Editor
            height="100%"
            defaultLanguage={language}
            theme={theme}
            value={code}
            onChange={onChange}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
              lineNumbers: 'on',
              roundedSelection: true,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 16, bottom: 16 },
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              smoothScrolling: true,
            }}
          />
        </div>
    );
}
