import { ReactNode } from "react";
import { CopyCodeButton } from "./CopyCodeButton";

/**
 * Modern Academic & Tech Blog MDX Components
 * Optimized for technical and academic content
 * - Clean, readable typography with Inter font
 * - Professional sizing and spacing
 * - Clear visual hierarchy
 * - Mobile-first responsive design
 */

export const mdxComponents = {
    /* ---------------- Headings ---------------- */

    h2: ({ children, ...props }: { children: ReactNode }) => (
        <h2
            className="
                mt-12 mb-5
                text-2xl md:text-3xl lg:text-4xl
                font-medium
                leading-tight
                text-foreground
                scroll-mt-24
                tracking-tight
                font-sans
            "
            {...props}
        >
            {children}
        </h2>
    ),

    h3: ({ children, ...props }: { children: ReactNode }) => (
        <h3
            className="
                mt-10 mb-4
                text-xl md:text-2xl lg:text-3xl
                font-medium
                leading-tight
                text-foreground
                scroll-mt-24
                tracking-tight
                font-sans
            "
            {...props}
        >
            {children}
        </h3>
    ),

    h4: ({ children, ...props }: { children: ReactNode }) => (
        <h4
            className="
                mt-8 mb-3
                text-lg md:text-xl lg:text-2xl
                font-semibold
                leading-snug
                text-foreground
                scroll-mt-24
                font-sans
            "
            {...props}
        >
            {children}
        </h4>
    ),

    h5: ({ children, ...props }: { children: ReactNode }) => (
        <h5
            className="
                mt-6 mb-3
                text-base md:text-lg lg:text-xl
                font-semibold
                leading-snug
                text-foreground
                scroll-mt-24
                font-sans
            "
            {...props}
        >
            {children}
        </h5>
    ),

    h6: ({ children, ...props }: { children: ReactNode }) => (
        <h6
            className="
                mt-6 mb-2
                text-base md:text-lg
                font-semibold
                leading-snug
                text-foreground/90
                scroll-mt-24
                font-sans
            "
            {...props}
        >
            {children}
        </h6>
    ),

    /* ---------------- Paragraphs ---------------- */

    p: ({ children, ...props }: { children: ReactNode }) => (
        <p
            className="
                mb-6
                text-base md:text-lg
                leading-relaxed md:leading-loose
                text-foreground/90
                tracking-normal
                font-merriweather
            "
            {...props}
        >
            {children}
        </p>
    ),

    /* ---------------- Links ---------------- */

    a: ({ children, ...props }: { children: ReactNode; href?: string }) => (
        <a
            className="
                text-primary
                underline
                decoration-primary/40
                underline-offset-4
                hover:decoration-primary
                hover:text-primary/80
                transition-all duration-200
                font-medium
                font-inter
            "
            target={props.href?.startsWith('http') ? '_blank' : undefined}
            rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            {...props}
        >
            {children}
        </a>
    ),

    /* ---------------- Inline Code ---------------- */

    code: ({ children, className, ...props }: { children: ReactNode; className?: string }) => {
        // Check if this is a code block (has language class from syntax highlighter)
        const isCodeBlock = className && className.includes('language-');

        // If it's inside a pre tag (code block), return without styling
        if (isCodeBlock) {
            return <code className={className} {...props}>{children}</code>;
        }

        // Inline code styling
        return (
            <code
                className="
                    px-1.5 py-0.5
                    mx-0.5
                    rounded
                    bg-muted
                    text-sm md:text-base
                    font-mono
                    text-primary
                    border border-border/50
                    whitespace-nowrap
                    font-medium
                "
                {...props}
            >
                {children}
            </code>
        );
    },

    /* ---------------- Code Blocks ---------------- */

    pre: ({ children, ...props }: { children: ReactNode }) => {
        // Extract text content for copy button
        const getTextContent = (node: ReactNode): string => {
            if (typeof node === 'string') return node;
            if (typeof node === 'number') return String(node);
            if (Array.isArray(node)) return node.map(getTextContent).join('');
            if (node && typeof node === 'object' && 'props' in node) {
                const reactNode = node as { props: { children?: ReactNode } };
                return getTextContent(reactNode.props.children);
            }
            return '';
        };

        const textContent = getTextContent(children);

        return (
            <div className="my-8 relative group overflow-hidden p-0.5 bg-gray-800 rounded-md">
                <CopyCodeButton code={textContent} />
                <pre
                    className="
                        overflow-x-auto
                        rounded-sm
                        bg-[#212121]
                        p-4 md:p-6
                        border border-gray-700
                        text-sm md:text-base
                        leading-relaxed
                        font-mono
                        shadow-none
                        [&_code]:bg-transparent
                        [&_code]:p-0
                        [&_code]:text-gray-100
                        [&_code]:border-0
                        [&_.token.comment]:text-[#6A9955]
                        [&_.token.prolog]:text-[#6A9955]
                        [&_.token.doctype]:text-[#6A9955]
                        [&_.token.cdata]:text-[#6A9955]
                        [&_.token.punctuation]:text-[#D4D4D4]
                        [&_.token.property]:text-[#9CDCFE]
                        [&_.token.tag]:text-[#569CD6]
                        [&_.token.boolean]:text-[#569CD6]
                        [&_.token.number]:text-[#B5CEA8]
                        [&_.token.constant]:text-[#9CDCFE]
                        [&_.token.symbol]:text-[#9CDCFE]
                        [&_.token.deleted]:text-[#CE9178]
                        [&_.token.selector]:text-[#D7BA7D]
                        [&_.token.attr-name]:text-[#9CDCFE]
                        [&_.token.string]:text-[#CE9178]
                        [&_.token.char]:text-[#CE9178]
                        [&_.token.builtin]:text-[#DCDCAA]
                        [&_.token.inserted]:text-[#B5CEA8]
                        [&_.token.operator]:text-[#D4D4D4]
                        [&_.token.entity]:text-[#569CD6]
                        [&_.token.url]:text-[#9CDCFE]
                        [&_.token.variable]:text-[#9CDCFE]
                        [&_.token.atrule]:text-[#C586C0]
                        [&_.token.attr-value]:text-[#CE9178]
                        [&_.token.function]:text-[#DCDCAA]
                        [&_.token.class-name]:text-[#4EC9B0]
                        [&_.token.keyword]:text-[#C586C0]
                        [&_.token.regex]:text-[#D16969]
                        [&_.token.important]:text-[#569CD6]
                    "
                    {...props}
                >
                    {children}
                </pre>
            </div>
        );
    },

    /* ---------------- Blockquote ---------------- */

    blockquote: ({ children, ...props }: { children: ReactNode }) => (
        <blockquote
            className="
                my-8
                border-l-4 border-primary
                pl-6 pr-4 md:pl-8 md:pr-6
                py-4 md:py-6
                bg-linear-to-r from-primary/5 to-transparent
                text-base md:text-lg
                italic
                leading-relaxed
                text-foreground/90
                rounded-r-xl
                shadow-sm
                font-inter
            "
            {...props}
        >
            {children}
        </blockquote>
    ),

    /* ---------------- Lists ---------------- */

    ul: ({ children, ...props }: { children: ReactNode }) => (
        <ul
            className="
                mb-6
                pl-6 md:pl-8
                space-y-3
                text-base md:text-lg
                leading-relaxed
                text-foreground/90
                list-disc
                marker:text-primary
                font-inter
            "
            {...props}
        >
            {children}
        </ul>
    ),

    ol: ({ children, ...props }: { children: ReactNode }) => (
        <ol
            className="
                mb-6
                pl-6 md:pl-8
                space-y-3
                text-base md:text-lg
                leading-relaxed
                text-foreground/90
                list-decimal
                marker:text-primary
                marker:font-semibold
                font-inter
            "
            {...props}
        >
            {children}
        </ol>
    ),

    li: ({ children, ...props }: { children: ReactNode }) => (
        <li className="pl-2" {...props}>
            {children}
        </li>
    ),

    /* ---------------- Horizontal Rule ---------------- */

    hr: (props: object) => (
        <hr
            className="
                my-12
                border-0
                h-px
                bg-linear-to-r from-transparent via-border to-transparent
                opacity-50
            "
            {...props}
        />
    ),

    /* ---------------- Tables ---------------- */

    table: ({ children, ...props }: { children: ReactNode }) => (
        <div className="my-8  md:mx-0 overflow-x-auto rounded-none border border-border shadow-none mx-auto">
            <table
                className="
                    w-full
                    border-collapse
                    text-sm md:text-base
                    min-w-[600px]
                    font-inter
                "
                {...props}
            >
                {children}
            </table>
        </div>
    ),

    thead: ({ children, ...props }: { children: ReactNode }) => (
        <thead className="bg-muted" {...props}>
            {children}
        </thead>
    ),

    th: ({ children, ...props }: { children: ReactNode }) => (
        <th
            className="
                px-4 md:px-6 py-3 md:py-4
                text-left
                text-xs md:text-sm
                font-bold
                uppercase
                tracking-wider
                text-foreground
                border-b-2 border-border
                whitespace-nowrap
                font-inter
            "
            {...props}
        >
            {children}
        </th>
    ),

    tbody: ({ children, ...props }: { children: ReactNode }) => (
        <tbody className="bg-background divide-y divide-border" {...props}>
            {children}
        </tbody>
    ),

    tr: ({ children, ...props }: { children: ReactNode }) => (
        <tr className="hover:bg-muted/50 transition-colors duration-150" {...props}>
            {children}
        </tr>
    ),

    td: ({ children, ...props }: { children: ReactNode }) => (
        <td
            className="
                px-4 md:px-6 py-3 md:py-4
                text-foreground/90
                leading-relaxed
                font-inter
            "
            {...props}
        >
            {children}
        </td>
    ),

    /* ---------------- Emphasis & Strong ---------------- */

    em: ({ children, ...props }: { children: ReactNode }) => (
        <em className="italic text-foreground font-inter" {...props}>
            {children}
        </em>
    ),

    strong: ({ children, ...props }: { children: ReactNode }) => (
        <strong className="font-semibold text-foreground font-inter" {...props}>
            {children}
        </strong>
    ),

    /* ---------------- Images ---------------- */

    img: ({ alt, ...props }: { alt?: string; src?: string }) => (
        <span className="block my-10 -mx-4 md:mx-0">
            <span className="block overflow-hidden rounded-none border border-border shadow-none">
                <img
                    className="
                        w-full
                        h-auto
                        object-cover
                    "
                    alt={alt}
                    loading="lazy"
                    {...props}
                />
            </span>
            {alt && (
                <span className="block mt-3 text-center text-sm md:text-base text-muted-foreground italic px-4 font-inter">
                    {alt}
                </span>
            )}
        </span>
    ),
};
