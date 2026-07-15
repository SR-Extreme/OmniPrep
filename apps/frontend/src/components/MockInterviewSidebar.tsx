'use client';

import { useEffect, useState } from 'react';
import {
    SECTION_ORDER,
    getSectionLabel,
    type MockInterviewSection,
    type MockInterviewSectionLockState,
    type MockInterviewSessionDetail,
} from '@/types/mock-interview';

export type MockWorkspaceSelection =
    | { section: 'DSA'; slotIndex: number }
    | { section: 'SYSTEM_DESIGN' }
    | { section: 'BEHAVIORAL' };

export interface MockInterviewSidebarProps {
    interview: MockInterviewSessionDetail;
    selection: MockWorkspaceSelection;
    onSelect: (selection: MockWorkspaceSelection) => void;
}

function lockBadge(lockState: MockInterviewSectionLockState): {
    label: string;
    className: string;
} {
    switch (lockState) {
        case 'ACTIVE':
            return {
                label: 'Active',
                className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
            };
        case 'SUBMITTED':
            return {
                label: 'Submitted',
                className: 'bg-zinc-100 text-zinc-600 ring-zinc-500/15',
            };
        case 'LOCKED':
        default:
            return {
                label: 'Locked',
                className: 'bg-zinc-50 text-zinc-400 ring-zinc-400/15',
            };
    }
}

function isSelected(
    selection: MockWorkspaceSelection,
    candidate: MockWorkspaceSelection,
): boolean {
    if (selection.section !== candidate.section) {
        return false;
    }
    if (selection.section === 'DSA' && candidate.section === 'DSA') {
        return selection.slotIndex === candidate.slotIndex;
    }
    return true;
}

export function MockInterviewSidebar({
    interview,
    selection,
    onSelect,
}: MockInterviewSidebarProps) {
    const [expanded, setExpanded] = useState<Record<MockInterviewSection, boolean>>({
        DSA: interview.currentSection === 'DSA',
        SYSTEM_DESIGN: interview.currentSection === 'SYSTEM_DESIGN',
        BEHAVIORAL: interview.currentSection === 'BEHAVIORAL',
    });

    useEffect(() => {
        setExpanded((prev) => ({
            ...prev,
            [interview.currentSection]: true,
        }));
    }, [interview.currentSection]);

    function toggleSection(section: MockInterviewSection) {
        setExpanded((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    }

    return (
        <aside className="flex h-full w-full flex-col border-r border-zinc-200 bg-white">
            <div className="border-b border-zinc-200 px-4 py-4">
                <p className="section-label">Mock interview</p>
                <h2 className="mt-1 text-sm font-semibold text-zinc-900">Sections</h2>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                    Complete each section in order. You cannot go back after submit.
                </p>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-3">
                <ul className="space-y-2">
                    {SECTION_ORDER.map((section) => {
                        const state = interview.sections.find((row) => row.section === section);
                        const lockState = state?.lockState ?? 'LOCKED';
                        const badge = lockBadge(lockState);
                        const isOpen = expanded[section];
                        const isActive = lockState === 'ACTIVE';
                        const canSelect = isActive;

                        return (
                            <li
                                key={section}
                                className={`rounded-lg border ${isActive
                                    ? 'border-emerald-200 bg-emerald-50/40'
                                    : 'border-zinc-200 bg-white'
                                    }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleSection(section)}
                                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
                                    aria-expanded={isOpen}
                                >
                                    <span
                                        className={`text-zinc-400 transition ${isOpen ? 'rotate-90' : ''
                                            }`}
                                        aria-hidden
                                    >
                                        ▸
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block text-sm font-medium text-zinc-900">
                                            {getSectionLabel(section)}
                                        </span>
                                    </span>
                                    <span
                                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${badge.className}`}
                                    >
                                        {badge.label}
                                    </span>
                                </button>

                                {isOpen ? (
                                    <ul className="space-y-1 border-t border-zinc-100 px-2 py-2">
                                        {section === 'DSA'
                                            ? interview.dsaProblems.map((slot) => {
                                                const item: MockWorkspaceSelection = {
                                                    section: 'DSA',
                                                    slotIndex: slot.slotIndex,
                                                };
                                                const selected = isSelected(selection, item);
                                                return (
                                                    <li key={slot.id}>
                                                        <button
                                                            type="button"
                                                            disabled={!canSelect}
                                                            onClick={() => onSelect(item)}
                                                            className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition ${selected
                                                                ? 'bg-emerald-600 text-white'
                                                                : canSelect
                                                                    ? 'text-zinc-700 hover:bg-zinc-100'
                                                                    : 'cursor-not-allowed text-zinc-400'
                                                                }`}
                                                        >
                                                            <span>
                                                                Problem {slot.slotIndex + 1}
                                                            </span>
                                                            <span
                                                                className={`text-xs ${selected
                                                                    ? 'text-emerald-100'
                                                                    : 'text-zinc-400'
                                                                    }`}
                                                            >
                                                                {slot.submissionId
                                                                    ? 'Linked'
                                                                    : 'Open'}
                                                            </span>
                                                        </button>
                                                    </li>
                                                );
                                            })
                                            : null}

                                        {section === 'SYSTEM_DESIGN' ? (
                                            <li>
                                                <button
                                                    type="button"
                                                    disabled={!canSelect}
                                                    onClick={() =>
                                                        onSelect({ section: 'SYSTEM_DESIGN' })
                                                    }
                                                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition ${isSelected(selection, {
                                                        section: 'SYSTEM_DESIGN',
                                                    })
                                                        ? 'bg-emerald-600 text-white'
                                                        : canSelect
                                                            ? 'text-zinc-700 hover:bg-zinc-100'
                                                            : 'cursor-not-allowed text-zinc-400'
                                                        }`}
                                                >
                                                    <span>Design question</span>
                                                    <span
                                                        className={`text-xs ${isSelected(selection, {
                                                            section: 'SYSTEM_DESIGN',
                                                        })
                                                            ? 'text-emerald-100'
                                                            : 'text-zinc-400'
                                                            }`}
                                                    >
                                                        {interview.systemDesign?.submissionId
                                                            ? 'Linked'
                                                            : 'Open'}
                                                    </span>
                                                </button>
                                            </li>
                                        ) : null}

                                        {section === 'BEHAVIORAL' ? (
                                            <li>
                                                <button
                                                    type="button"
                                                    disabled={!canSelect}
                                                    onClick={() =>
                                                        onSelect({ section: 'BEHAVIORAL' })
                                                    }
                                                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition ${isSelected(selection, {
                                                        section: 'BEHAVIORAL',
                                                    })
                                                        ? 'bg-emerald-600 text-white'
                                                        : canSelect
                                                            ? 'text-zinc-700 hover:bg-zinc-100'
                                                            : 'cursor-not-allowed text-zinc-400'
                                                        }`}
                                                >
                                                    <span>Behavioral interview</span>
                                                    <span
                                                        className={`text-xs ${isSelected(selection, {
                                                            section: 'BEHAVIORAL',
                                                        })
                                                            ? 'text-emerald-100'
                                                            : 'text-zinc-400'
                                                            }`}
                                                    >
                                                        {interview.behavioral?.sessionId
                                                            ? 'In progress'
                                                            : interview.behavioral?.roleName
                                                                ? interview.behavioral.roleName
                                                                : 'Select role'}
                                                    </span>
                                                </button>
                                            </li>
                                        ) : null}
                                    </ul>
                                ) : null}
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}