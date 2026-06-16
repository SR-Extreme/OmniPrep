'use client';
import dynamic from 'next/dynamic';
import type { ProgrammingLanguage } from '@/types/dsa';

const Editor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false,
    loading: () => (
        <div className="flex h-[400px] items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-sm text-slate-400">
            Loading editor…
        </div>
    ),
})

const LANGUAGE_TO_MONACO: Record<ProgrammingLanguage, string> = {
    CPP: 'cpp',
    JAVA: 'java',
    PYTHON: 'python',
};

export interface MonacoEditorProps {
    value: string;
    onChange: (value: string) => void;
    language: ProgrammingLanguage;
    readOnly?: boolean;
    height?: string;
    className?: string;
}

export function MonacoEditor({
    value, onChange, language, readOnly = false, height = '400px', className,
}: MonacoEditorProps) {
    return (
        <div
            className={[
                'overflow-hidden rounded-lg border border-slate-800',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        >
            <Editor
                height={height}
                language={LANGUAGE_TO_MONACO[language]}
                value={value}
                onChange={(next) => onChange(next ?? '')}
                theme="vs-dark"
                options={{
                    readOnly,
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 4,
                    wordWrap: 'on',
                }}
            />
        </div>
    );
}