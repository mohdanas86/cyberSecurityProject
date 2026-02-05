'use client'

import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from './mdx-components';

export default function MarkdownContent({ content }: { content: string }) {
    return (
        <div className="flex w-full">
            <MDXRemote
                source={content}
                components={mdxComponents}
                options={{
                    mdxOptions: {
                        remarkPlugins: [remarkGfm, remarkBreaks],
                        rehypePlugins: [
                            rehypeSlug,
                            rehypeAutolinkHeadings,
                            [
                                rehypePrettyCode,
                                {
                                    theme: 'github-dark',
                                    keepBackground: false,
                                }
                            ]
                        ],
                    },
                }}
            />
        </div>
    )
}