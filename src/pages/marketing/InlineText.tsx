import React from 'react';
import type { InlineTextFragment, InlineTextMarks } from './blogs.model';

export type InlineTextMark = keyof InlineTextMarks;

export const inlineTextValue = (fragments: InlineTextFragment[]): string =>
  fragments.map((fragment) => fragment.text).join('');

export const fragmentsFromText = (text: string, fragments?: InlineTextFragment[]): InlineTextFragment[] => {
  if (fragments?.length && inlineTextValue(fragments) === text) return fragments;
  return text ? [{ text }] : [];
};

export const applyInlineMark = (
  text: string,
  fragments: InlineTextFragment[] | undefined,
  start: number,
  end: number,
  mark: InlineTextMark,
  value: boolean | string,
): InlineTextFragment[] => {
  if (start >= end || start < 0 || end > text.length) return fragmentsFromText(text, fragments);

  const source = fragmentsFromText(text, fragments);
  let offset = 0;
  const next: InlineTextFragment[] = [];

  source.forEach((fragment) => {
    const fragmentStart = offset;
    const fragmentEnd = offset + fragment.text.length;
    const overlapStart = Math.max(start, fragmentStart);
    const overlapEnd = Math.min(end, fragmentEnd);

    if (overlapStart >= overlapEnd) {
      next.push(fragment);
    } else {
      const localStart = overlapStart - fragmentStart;
      const localEnd = overlapEnd - fragmentStart;
      const parts = [
        { text: fragment.text.slice(0, localStart), marks: fragment.marks },
        {
          text: fragment.text.slice(localStart, localEnd),
          marks: { ...fragment.marks, [mark]: value },
        },
        { text: fragment.text.slice(localEnd), marks: fragment.marks },
      ];
      parts.forEach((part) => {
        if (part.text) next.push(part);
      });
    }

    offset = fragmentEnd;
  });

  return next.map((fragment) => {
    if (!fragment.marks || Object.values(fragment.marks).some(Boolean)) return fragment;
    return { text: fragment.text };
  });
};

const fragmentStyle = (fragment: InlineTextFragment): React.CSSProperties => ({
  fontWeight: fragment.marks?.bold ? 700 : undefined,
  fontStyle: fragment.marks?.italic ? 'italic' : undefined,
  color: fragment.marks?.color,
  backgroundColor: fragment.marks?.highlight,
});

export const InlineText: React.FC<{
  text?: string;
  fragments?: InlineTextFragment[];
  dropCap?: boolean;
}> = ({ text = '', fragments, dropCap = false }) => {
  if (!fragments?.length || inlineTextValue(fragments) !== text) return <>{text}</>;

  const content = fragments.map((fragment, index) => (
    <span key={`${index}-${fragment.text}`} style={fragmentStyle(fragment)}>
      {fragment.text}
    </span>
  ));

  if (!dropCap) return <>{content}</>;

  const firstText = fragments[0]?.text || '';
  if (!firstText) return <>{content}</>;

  const firstCharacter = firstText.charAt(0);
  const remainingFragments = [
    { ...fragments[0], text: firstText.slice(1) },
    ...fragments.slice(1),
  ].filter((fragment) => fragment.text.length > 0);

  return (
    <>
      <span
        style={{
          float: 'left',
          fontFamily: 'var(--font-display)',
          fontSize: 80,
          lineHeight: 0.78,
          paddingRight: 12,
          paddingTop: 8,
          fontWeight: 400,
          ...fragmentStyle(fragments[0]),
        }}
      >
        {firstCharacter}
      </span>
      {remainingFragments.map((fragment, index) => (
        <span key={`${index}-${fragment.text}`} style={fragmentStyle(fragment)}>
          {fragment.text}
        </span>
      ))}
    </>
  );
};