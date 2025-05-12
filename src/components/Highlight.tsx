import React from "react";

export interface HighlightProps {
    label?: string | number | null;
    search?: string;
    bgcolor?: string;
    color?: string;
}

export default function Highlight({ label = "", search = "", bgcolor = "#337ab7", color = "#fff" }: HighlightProps) {
    let parts: Array<string | React.JSX.Element> = [];
    if (!label) label = "";

    const escapedSearch = search?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    if (typeof label !== "string") parts = label.toString().split(new RegExp(`(${escapedSearch})`, 'gi'));
    else {
        parts = label.split(new RegExp(`(${escapedSearch})`, 'gi'));
    }

    return <>
        {parts.map((part, i) => <>
            <span key={i} style={part?.toString()?.toLowerCase() === search?.toString()?.toLowerCase() ? { backgroundColor: bgcolor, color } : {}}>
                {part}
            </span>
        </>)}
    </>;
} 