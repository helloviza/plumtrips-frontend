/* eslint-disable react-refresh/only-export-components */
import React, {
  useRef,
  useLayoutEffect,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
} from 'react';
import type { InlineTextFragment, InlineTextMarks } from './blogs.model';

export type { InlineTextFragment, InlineTextMarks };
export type InlineTextMark = keyof InlineTextMarks;

/**
 * Validates and sanitizes a URL for safe hyperlink usage.
 * - Allows https:, http:, and mailto: protocols.
 * - Allows safe relative paths (/path or #hash).
 * - Explicitly rejects javascript:, data:, vbscript:, and protocol-relative (//) URLs.
 */
export const sanitizeHref = (href?: string): string | null => {
  if (!href) return null;
  const trimmed = href.trim();
  if (!trimmed) return null;

  // Reject control characters and non-printable whitespace
  for (let i = 0; i < trimmed.length; i++) {
    const code = trimmed.charCodeAt(i);
    if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) return null;
  }

  // Support safe relative paths (must start with / or #, but reject protocol-relative //)
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    if (trimmed.startsWith('//')) return null;
    return trimmed;
  }

  // Attempt auto-prepending https:// for plain domains (e.g. "plumtrips.com" or "www.example.com")
  let urlToParse = trimmed;
  if (!trimmed.includes('://') && !trimmed.startsWith('mailto:')) {
    if (trimmed.includes('.') && !trimmed.includes(' ')) {
      urlToParse = `https://${trimmed}`;
    } else {
      return null;
    }
  }

  try {
    const parsed = new URL(urlToParse);
    const protocol = parsed.protocol.toLowerCase();
    if (protocol === 'https:' || protocol === 'http:' || protocol === 'mailto:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
};

export const areMarksEqual = (
  m1?: InlineTextMarks,
  m2?: InlineTextMarks,
): boolean => {
  if (!m1 && !m2) return true;
  if (!m1 || !m2) return false;
  return (
    Boolean(m1.bold) === Boolean(m2.bold) &&
    Boolean(m1.italic) === Boolean(m2.italic) &&
    Boolean(m1.underline) === Boolean(m2.underline) &&
    Boolean(m1.strikethrough) === Boolean(m2.strikethrough) &&
    (m1.color || '') === (m2.color || '') &&
    (m1.highlight || '') === (m2.highlight || '') &&
    (m1.href || '') === (m2.href || '') &&
    Boolean(m1.targetBlank) === Boolean(m2.targetBlank)
  );
};

export const hasAnyInlineMark = (marks?: InlineTextMarks): boolean =>
  Boolean(
    marks &&
      (marks.bold ||
        marks.italic ||
        marks.underline ||
        marks.strikethrough ||
        marks.color ||
        marks.highlight ||
        marks.href),
  );

/** Drop href/targetBlank so adjacent hyperlinks are not treated as typing intent. */
export const withoutLinkMarks = (marks?: InlineTextMarks): InlineTextMarks => {
  if (!marks) return {};
  const next = { ...marks };
  delete next.href;
  delete next.targetBlank;
  return next;
};

/**
 * Typing intent at the caret:
 * - Visual marks follow an explicit pending override, otherwise the caret fragment.
 * - href is applied only while link mode (pending override with href) is on.
 * - Ordinary typing next to a link does not inherit that href.
 */
export const resolveTypingMarks = (
  fragmentMarks: InlineTextMarks | undefined,
  pendingOverride: boolean,
  pendingMarks?: InlineTextMarks,
): InlineTextMarks => {
  const visual = withoutLinkMarks(pendingOverride ? pendingMarks : fragmentMarks);
  if (pendingOverride && pendingMarks?.href) {
    return {
      ...visual,
      href: pendingMarks.href,
      targetBlank: pendingMarks.targetBlank !== false,
    };
  }
  return visual;
};

export const CLEARABLE_INLINE_MARKS: InlineTextMark[] = [
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'color',
  'highlight',
  'href',
];

/**
 * Marks of the character at `index`, or {} if out of range.
 * Missing `underline` on older fragments is treated as unset (backward compatible).
 */
export const getMarksAtIndex = (
  fragments: InlineTextFragment[] | undefined,
  index: number,
): InlineTextMarks => {
  if (!fragments?.length || index < 0) return {};
  let offset = 0;
  for (const fragment of fragments) {
    const next = offset + fragment.text.length;
    if (index >= offset && index < next) {
      return fragment.marks ? { ...fragment.marks } : {};
    }
    offset = next;
  }
  return {};
};

/** Collapsed-caret marks: left-affinity, first character at offset 0. */
export const getMarksAtCaret = (
  fragments: InlineTextFragment[] | undefined,
  offset: number,
): InlineTextMarks => {
  if (!fragments?.length) return {};
  if (offset <= 0) return getMarksAtIndex(fragments, 0);
  return getMarksAtIndex(fragments, offset - 1);
};

export const isBooleanMarkActiveInRange = (
  fragments: InlineTextFragment[] | undefined,
  start: number,
  end: number,
  mark: InlineTextMark,
): boolean => {
  if (!fragments?.length || start >= end) return false;
  let offset = 0;
  for (const fragment of fragments) {
    const fStart = offset;
    const fEnd = offset + fragment.text.length;
    offset = fEnd;
    if (Math.max(start, fStart) < Math.min(end, fEnd)) {
      if (fragment.marks && Boolean(fragment.marks[mark])) return true;
    }
  }
  return false;
};

export const getSharedValueMarkInRange = (
  fragments: InlineTextFragment[] | undefined,
  start: number,
  end: number,
  mark: 'color' | 'highlight' | 'href',
): string => {
  if (!fragments?.length || start >= end) return '';
  let offset = 0;
  let found: string | null = null;
  for (const fragment of fragments) {
    const fStart = offset;
    const fEnd = offset + fragment.text.length;
    offset = fEnd;
    if (Math.max(start, fStart) < Math.min(end, fEnd)) {
      const value = (fragment.marks?.[mark] as string | undefined) || '';
      if (found === null) found = value;
      else if (found !== value) return '';
    }
  }
  return found || '';
};

export const textDecorationForMarks = (
  marks?: InlineTextMarks,
  isLink = false,
): string | undefined => {
  const parts: string[] = [];
  if (marks?.strikethrough) parts.push('line-through');
  if (marks?.underline || isLink) parts.push('underline');
  return parts.length > 0 ? parts.join(' ') : undefined;
};

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
  value: boolean | string | undefined,
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

      const newMarks: InlineTextMarks = { ...fragment.marks };
      if (value === false || value === '' || value === undefined) {
        delete (newMarks as Record<string, unknown>)[mark];
        if (mark === 'href') {
          delete newMarks.targetBlank;
        }
      } else {
        (newMarks as Record<string, unknown>)[mark] = value;
      }

      const targetMarks = hasAnyInlineMark(newMarks) ? newMarks : undefined;

      const parts: InlineTextFragment[] = [
        { text: fragment.text.slice(0, localStart), marks: fragment.marks },
        { text: fragment.text.slice(localStart, localEnd), marks: targetMarks },
        { text: fragment.text.slice(localEnd), marks: fragment.marks },
      ];
      parts.forEach((part) => {
        if (part.text) next.push(part);
      });
    }

    offset = fragmentEnd;
  });

  // Clean empty marks
  const cleaned = next
    .map((fragment) => {
      if (!hasAnyInlineMark(fragment.marks)) {
        return { text: fragment.text };
      }
      return fragment;
    })
    .filter((f) => f.text.length > 0);

  // Merge adjacent fragments with equal marks
  const merged: InlineTextFragment[] = [];
  for (const frag of cleaned) {
    const prev = merged[merged.length - 1];
    if (prev && areMarksEqual(prev.marks, frag.marks)) {
      prev.text += frag.text;
    } else {
      merged.push({ ...frag });
    }
  }

  return merged;
};

export const clearInlineMarks = (
  text: string,
  fragments: InlineTextFragment[] | undefined,
  start: number,
  end: number,
): InlineTextFragment[] => {
  let inline = fragmentsFromText(text, fragments);
  for (const mark of CLEARABLE_INLINE_MARKS) {
    inline = applyInlineMark(text, inline, start, end, mark, false);
  }
  return inline;
};

/**
 * Reconciles inline text fragments when the block's text changes.
 * - Slices and preserves unaffected formatting before and after the edit.
 * - Deletes fragments or sub-fragments inside the replaced/deleted range.
 * - Applies pendingMarks to newly inserted text if active; otherwise leaves inserted text plain.
 * - Avoids extending links or adjacent marks into newly typed plain text.
 * - Guarantees the concatenated text of the returned fragments equals newText.
 */
export const reconcileInlineFragments = (
  oldText: string,
  newText: string,
  oldFragments: InlineTextFragment[] | undefined,
  selection?: { start: number; end: number },
  pendingMarks?: InlineTextMarks,
): InlineTextFragment[] => {
  if (oldText === newText) {
    return fragmentsFromText(newText, oldFragments);
  }

  if (!newText) {
    return [];
  }

  // 1. Identify edit boundaries: editStart, editEnd, and insertedText
  let editStart = -1;
  let editEnd = -1;
  let insertedText = '';

  if (selection && typeof selection.start === 'number' && typeof selection.end === 'number') {
    const { start, end } = selection;
    if (end > start && start >= 0 && end <= oldText.length) {
      const delLen = end - start;
      const insLen = newText.length - (oldText.length - delLen);
      if (insLen >= 0 && start + insLen <= newText.length) {
        const candidateIns = newText.slice(start, start + insLen);
        if (oldText.slice(0, start) + candidateIns + oldText.slice(end) === newText) {
          editStart = start;
          editEnd = end;
          insertedText = candidateIns;
        }
      }
    } else if (start === end && start >= 0 && start <= oldText.length) {
      if (newText.length > oldText.length) {
        const insLen = newText.length - oldText.length;
        const candidateIns = newText.slice(start, start + insLen);
        if (oldText.slice(0, start) + candidateIns + oldText.slice(start) === newText) {
          editStart = start;
          editEnd = start;
          insertedText = candidateIns;
        }
      } else if (newText.length < oldText.length) {
        const delLen = oldText.length - newText.length;
        // Check Backspace (deleted preceding text)
        if (start - delLen >= 0 && oldText.slice(0, start - delLen) + oldText.slice(start) === newText) {
          editStart = start - delLen;
          editEnd = start;
          insertedText = '';
        } else if (start + delLen <= oldText.length && oldText.slice(0, start) + oldText.slice(start + delLen) === newText) {
          // Check Delete (deleted forward text)
          editStart = start;
          editEnd = start + delLen;
          insertedText = '';
        }
      }
    }
  }

  // Fallback to common prefix and suffix matching
  if (editStart === -1) {
    let prefix = 0;
    while (prefix < oldText.length && prefix < newText.length && oldText[prefix] === newText[prefix]) {
      prefix++;
    }
    let suffix = 0;
    while (
      suffix < oldText.length - prefix &&
      suffix < newText.length - prefix &&
      oldText[oldText.length - 1 - suffix] === newText[newText.length - 1 - suffix]
    ) {
      suffix++;
    }
    editStart = prefix;
    editEnd = oldText.length - suffix;
    insertedText = newText.slice(prefix, newText.length - suffix);
  }

  // 2. Splice fragments around [editStart, editEnd]
  const source = fragmentsFromText(oldText, oldFragments);
  const next: InlineTextFragment[] = [];
  let offset = 0;
  let inserted = false;

  const validPendingMarks = hasAnyInlineMark(pendingMarks) ? { ...pendingMarks } : undefined;

  for (const frag of source) {
    const fStart = offset;
    const fEnd = offset + frag.text.length;
    offset = fEnd;

    // Fragment is entirely before the edit
    if (fEnd <= editStart) {
      next.push(frag);
      continue;
    }

    // Fragment is entirely after the edit
    if (fStart >= editEnd) {
      if (!inserted) {
        if (insertedText) {
          next.push({ text: insertedText, marks: validPendingMarks });
        }
        inserted = true;
      }
      next.push(frag);
      continue;
    }

    // Part of fragment before editStart
    if (fStart < editStart) {
      next.push({
        text: frag.text.slice(0, editStart - fStart),
        marks: frag.marks,
      });
    }

    // Insert new text at the edit boundary
    if (!inserted) {
      if (insertedText) {
        next.push({ text: insertedText, marks: validPendingMarks });
      }
      inserted = true;
    }

    // Part of fragment after editEnd
    if (fEnd > editEnd) {
      next.push({
        text: frag.text.slice(editEnd - fStart),
        marks: frag.marks,
      });
    }
  }

  if (!inserted && insertedText) {
    next.push({ text: insertedText, marks: validPendingMarks });
  }

  // 3. Clean empty fragments and merge adjacent with identical marks
  const cleaned = next
    .map((frag) => {
      if (!hasAnyInlineMark(frag.marks)) {
        return { text: frag.text };
      }
      return frag;
    })
    .filter((frag) => frag.text.length > 0);

  const merged: InlineTextFragment[] = [];
  for (const frag of cleaned) {
    const prev = merged[merged.length - 1];
    if (prev && areMarksEqual(prev.marks, frag.marks)) {
      prev.text += frag.text;
    } else {
      merged.push({ ...frag });
    }
  }

  return merged;
};

const fragmentStyle = (fragment: InlineTextFragment): React.CSSProperties => ({
  fontWeight: fragment.marks?.bold ? 700 : undefined,
  fontStyle: fragment.marks?.italic ? 'italic' : undefined,
  textDecoration: textDecorationForMarks(fragment.marks),
  color: fragment.marks?.color,
  backgroundColor: fragment.marks?.highlight,
});

const renderFragmentContent = (fragment: InlineTextFragment, key: string | number) => {
  const safeHref = sanitizeHref(fragment.marks?.href);
  const style = fragmentStyle(fragment);

  if (safeHref) {
    const isTargetBlank = fragment.marks?.targetBlank !== false;
    return (
      <a
        key={key}
        href={safeHref}
        target={isTargetBlank ? '_blank' : undefined}
        rel={isTargetBlank ? 'noopener noreferrer' : undefined}
        style={{
          ...style,
          color: fragment.marks?.color || 'var(--blog-accent, #c8943a)',
          textDecoration: textDecorationForMarks(fragment.marks, true),
          cursor: 'pointer',
        }}
      >
        {fragment.text}
      </a>
    );
  }

  return (
    <span key={key} style={style}>
      {fragment.text}
    </span>
  );
};

export const InlineText: React.FC<{
  text?: string;
  fragments?: InlineTextFragment[];
  dropCap?: boolean;
}> = ({ text = '', fragments, dropCap = false }) => {
  if (!fragments?.length || inlineTextValue(fragments) !== text) return <>{text}</>;

  if (dropCap) {
    const firstText = fragments[0]?.text || '';
    if (firstText) {
      const firstCharacter = firstText.charAt(0);
      const remainingFirstText = firstText.slice(1);
      const remainingFragments = [
        ...(remainingFirstText ? [{ ...fragments[0], text: remainingFirstText }] : []),
        ...fragments.slice(1),
      ].filter((fragment) => fragment.text.length > 0);

      const dropCapStyle: React.CSSProperties = {
        float: 'left',
        fontFamily: 'var(--font-display)',
        fontSize: 80,
        lineHeight: 0.78,
        paddingRight: 12,
        paddingTop: 8,
        fontWeight: 400,
        ...fragmentStyle(fragments[0]),
      };

      const firstSafeHref = sanitizeHref(fragments[0]?.marks?.href);
      const isTargetBlank = fragments[0]?.marks?.targetBlank !== false;

      return (
        <>
          {firstSafeHref ? (
            <a
              href={firstSafeHref}
              target={isTargetBlank ? '_blank' : undefined}
              rel={isTargetBlank ? 'noopener noreferrer' : undefined}
              style={{
                ...dropCapStyle,
                color: fragments[0]?.marks?.color || 'var(--blog-accent, #c8943a)',
                textDecoration: textDecorationForMarks(fragments[0]?.marks, true) || 'none',
              }}
            >
              {firstCharacter}
            </a>
          ) : (
            <span style={dropCapStyle}>{firstCharacter}</span>
          )}
          {remainingFragments.map((fragment, index) => renderFragmentContent(fragment, `${index}-${fragment.text}`))}
        </>
      );
    }
  }

  return (
    <>
      {fragments.map((fragment, index) => renderFragmentContent(fragment, `${index}-${fragment.text}`))}
    </>
  );
};

/**
 * Calculates character offsets { start, end } within container from DOM selection.
 */
export const getSelectionOffsets = (container: HTMLElement): { start: number; end: number } | null => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) {
    return null;
  }

  const preRangeStart = range.cloneRange();
  preRangeStart.selectNodeContents(container);
  preRangeStart.setEnd(range.startContainer, range.startOffset);
  const start = preRangeStart.toString().length;

  const preRangeEnd = range.cloneRange();
  preRangeEnd.selectNodeContents(container);
  preRangeEnd.setEnd(range.endContainer, range.endOffset);
  const end = preRangeEnd.toString().length;

  return { start, end };
};

/**
 * Sets DOM selection inside container to character offsets { start, end }.
 */
export const setSelectionOffsets = (container: HTMLElement, start: number, end: number) => {
  const sel = window.getSelection();
  if (!sel) return;

  let charCount = 0;
  let startNode: Node | null = null;
  let startOffset = 0;
  let endNode: Node | null = null;
  let endOffset = 0;

  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  let textNode = walker.nextNode();

  while (textNode) {
    const nodeLength = textNode.nodeValue?.length || 0;
    if (!startNode && charCount + nodeLength >= start) {
      startNode = textNode;
      startOffset = Math.max(0, start - charCount);
    }
    if (!endNode && charCount + nodeLength >= end) {
      endNode = textNode;
      endOffset = Math.max(0, end - charCount);
      break;
    }
    charCount += nodeLength;
    textNode = walker.nextNode();
  }

  if (!startNode) {
    startNode = container;
    startOffset = start === 0 ? 0 : container.childNodes.length;
  }
  if (!endNode) {
    endNode = startNode;
    endOffset = end === 0 ? 0 : startOffset;
  }

  try {
    const range = document.createRange();
    const safeStartOffset =
      startNode.nodeType === Node.TEXT_NODE
        ? Math.min(startOffset, startNode.nodeValue?.length ?? 0)
        : Math.min(startOffset, startNode.childNodes.length);
    const safeEndOffset =
      endNode.nodeType === Node.TEXT_NODE
        ? Math.min(endOffset, endNode.nodeValue?.length ?? 0)
        : Math.min(endOffset, endNode.childNodes.length);

    range.setStart(startNode, safeStartOffset);
    range.setEnd(endNode, safeEndOffset);
    sel.removeAllRanges();
    sel.addRange(range);
  } catch {
    // fallback if node structure changed
  }
};

export const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const renderFragmentsToHtml = (fragments: InlineTextFragment[]): string => {
  if (!fragments || fragments.length === 0) {
    return '<br>';
  }
  const totalLength = fragments.reduce((acc, f) => acc + (f.text?.length || 0), 0);
  if (totalLength === 0) {
    return '<br>';
  }

  let html = fragments
    .map((frag) => {
      const isLink = Boolean(frag.marks?.href);
      const safeHref = sanitizeHref(frag.marks?.href);
      const styles: string[] = [];

      if (frag.marks?.bold) styles.push('font-weight: 700;');
      if (frag.marks?.italic) styles.push('font-style: italic;');
      const decoration = textDecorationForMarks(frag.marks, isLink);
      if (decoration) {
        styles.push(`text-decoration: ${decoration};`);
      }
      if (frag.marks?.color) {
        styles.push(`color: ${frag.marks.color};`);
      } else if (isLink) {
        styles.push('color: var(--blog-accent, #6d28d9);');
      }
      if (frag.marks?.highlight) {
        styles.push(`background-color: ${frag.marks.highlight};`);
      }

      const escapedText = escapeHtml(frag.text);

      if (isLink) {
        const linkStyles = [...styles, 'cursor: text;'];
        return `<a href="${escapeHtml(safeHref || '#')}" style="${linkStyles.join(' ')}">${escapedText}</a>`;
      }

      if (styles.length > 0) {
        return `<span style="${styles.join(' ')}">${escapedText}</span>`;
      }

      return escapedText;
    })
    .join('');

  const lastFrag = fragments[fragments.length - 1];
  if (lastFrag?.text?.endsWith('\n')) {
    html += '<br>';
  }

  return html;
};

export interface InlineRichTextEditorRef {
  focus: () => void;
  setSelectionRange: (start: number, end: number) => void;
  getSelectionRange: () => { start: number; end: number };
  getElement: () => HTMLElement | null;
}

export interface InlineRichTextEditorProps {
  value: string;
  fragments?: InlineTextFragment[];
  onChange: (text: string, fragments: InlineTextFragment[]) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onSelectionChange?: (sel: { start: number; end: number }) => void;
  onFormatKey?: (mark: 'bold' | 'italic' | 'underline' | 'strikethrough') => void;
  pendingMarks?: InlineTextMarks;
  placeholder?: string;
  style?: React.CSSProperties;
  multiline?: boolean;
  blockType?: string;
}

/**
 * True inline rich-text editing surface.
 * Directly renders bold, italic, underline, strikethrough, text color, highlight, and hyperlinks
 * inside an interactive contentEditable area while typing.
 */
export const InlineRichTextEditor = forwardRef<InlineRichTextEditorRef, InlineRichTextEditorProps>(
  (
    {
      value,
      fragments,
      onChange,
      onFocus,
      onBlur,
      onSelectionChange,
      onFormatKey,
      pendingMarks,
      placeholder,
      style,
      multiline = true,
      blockType,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const isFocusedRef = useRef(false);
    const [isFocused, setIsFocused] = useState(false);
    const targetSelectionRef = useRef<{ start: number; end: number } | null>(null);
    const lastSelectionRef = useRef<{ start: number; end: number }>({ start: 0, end: 0 });

    const normalizedFragments = fragmentsFromText(value, fragments);
    const targetHtml = renderFragmentsToHtml(normalizedFragments);

    useImperativeHandle(ref, () => ({
      focus: () => {
        containerRef.current?.focus();
      },
      setSelectionRange: (start: number, end: number) => {
        if (containerRef.current) {
          containerRef.current.focus();
          setSelectionOffsets(containerRef.current, start, end);
          lastSelectionRef.current = { start, end };
        }
      },
      getSelectionRange: () => {
        if (containerRef.current) {
          const offsets = getSelectionOffsets(containerRef.current);
          if (offsets) return offsets;
        }
        return lastSelectionRef.current;
      },
      getElement: () => containerRef.current,
    }));

    useLayoutEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      if (container.innerHTML !== targetHtml) {
        container.innerHTML = targetHtml;
      }

      if (isFocusedRef.current && targetSelectionRef.current) {
        const { start, end } = targetSelectionRef.current;
        targetSelectionRef.current = null;
        setSelectionOffsets(container, start, end);
      }
    });

    const updateSelection = useCallback(() => {
      if (!containerRef.current) return;
      const offsets = getSelectionOffsets(containerRef.current);
      if (offsets) {
        lastSelectionRef.current = offsets;
        onSelectionChange?.(offsets);
      }
    }, [onSelectionChange]);

    const handleInput = () => {
      const container = containerRef.current;
      if (!container) return;

      let rawText = container.innerText ?? container.textContent ?? '';
      if (rawText === '\n' && !container.textContent) {
        rawText = '';
      }
      const nextText = rawText.replace(/\r\n/g, '\n');

      const oldText = value || '';
      const currentSelection = lastSelectionRef.current;

      const nextFragments = reconcileInlineFragments(
        oldText,
        nextText,
        fragments,
        currentSelection,
        pendingMarks,
      );

      const offsets = getSelectionOffsets(container);
      const caret = offsets?.start ?? (currentSelection.start + (nextText.length - oldText.length));
      const endCaret = offsets?.end ?? caret;

      targetSelectionRef.current = { start: caret, end: endCaret };
      lastSelectionRef.current = { start: caret, end: endCaret };

      onSelectionChange?.({ start: caret, end: endCaret });
      onChange(nextText, nextFragments);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        const key = e.key.toLowerCase();
        if (key === 'b' || key === 'i' || key === 'u') {
          e.preventDefault();
          const mark = key === 'b' ? 'bold' : key === 'i' ? 'italic' : 'underline';
          onFormatKey?.(mark);
          return;
        }
        if (key === 'x' && e.shiftKey) {
          e.preventDefault();
          onFormatKey?.('strikethrough');
          return;
        }
      }
      if (e.key === 'Enter') {
        if (!multiline) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        const currentSelection = lastSelectionRef.current;
        const oldText = value || '';
        const nextText = oldText.slice(0, currentSelection.start) + '\n' + oldText.slice(currentSelection.end);
        const nextFragments = reconcileInlineFragments(
          oldText,
          nextText,
          fragments,
          currentSelection,
          pendingMarks,
        );

        const nextPos = currentSelection.start + 1;
        targetSelectionRef.current = { start: nextPos, end: nextPos };
        lastSelectionRef.current = { start: nextPos, end: nextPos };

        onSelectionChange?.({ start: nextPos, end: nextPos });
        onChange(nextText, nextFragments);
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      if (!text) return;

      const currentSelection = lastSelectionRef.current;
      const oldText = value || '';
      const nextText = oldText.slice(0, currentSelection.start) + text + oldText.slice(currentSelection.end);
      const nextFragments = reconcileInlineFragments(
        oldText,
        nextText,
        fragments,
        currentSelection,
        pendingMarks,
      );

      const nextPos = currentSelection.start + text.length;
      targetSelectionRef.current = { start: nextPos, end: nextPos };
      lastSelectionRef.current = { start: nextPos, end: nextPos };

      onSelectionChange?.({ start: nextPos, end: nextPos });
      onChange(nextText, nextFragments);
    };

    const isEmpty = !value;

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        {isEmpty && placeholder && !isFocused && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              left: 12,
              color: '#9ca3af',
              pointerEvents: 'none',
              userSelect: 'none',
              fontSize: style?.fontSize || 14,
              fontStyle: blockType === 'quote' ? 'italic' : undefined,
              lineHeight: 1.5,
            }}
          >
            {placeholder}
          </div>
        )}
        <div
          ref={containerRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline={multiline}
          aria-placeholder={placeholder}
          data-placeholder={placeholder}
          onInput={handleInput}
          onBeforeInput={(e) => {
            const inputType = (e.nativeEvent as InputEvent).inputType;
            if (
              inputType === 'formatBold' ||
              inputType === 'formatItalic' ||
              inputType === 'formatUnderline' ||
              inputType === 'formatStrikeThrough'
            ) {
              e.preventDefault();
            }
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onClick={(e) => {
            const target = e.target as HTMLElement | null;
            if (target?.tagName === 'A') {
              e.preventDefault();
            }
          }}
          onFocus={() => {
            isFocusedRef.current = true;
            setIsFocused(true);
            onFocus?.();
            updateSelection();
          }}
          onBlur={() => {
            isFocusedRef.current = false;
            setIsFocused(false);
            onBlur?.();
          }}
          onMouseUp={updateSelection}
          onKeyUp={updateSelection}
          onSelect={updateSelection}
          style={{
            width: '100%',
            minHeight: multiline ? 80 : 38,
            padding: '10px 12px',
            borderRadius: 8,
            border: isFocused ? '1px solid #7c3aed' : '1px solid #ddd',
            boxShadow: isFocused ? '0 0 0 2px rgba(124, 58, 237, 0.15)' : 'none',
            fontSize: 14,
            lineHeight: 1.5,
            outline: 'none',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: '#fff',
            boxSizing: 'border-box',
            cursor: 'text',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            ...style,
          }}
        />
      </div>
    );
  },
);

InlineRichTextEditor.displayName = 'InlineRichTextEditor';