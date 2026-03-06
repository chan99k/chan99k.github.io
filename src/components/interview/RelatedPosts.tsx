interface PostLink {
    slug: string;
    title: string;
}

interface Props {
    posts: PostLink[];
}

export function RelatedPosts({ posts }: Props) {
    if (posts.length === 0) return null;

    return (
        <div className="mt-4">
            <p className="mb-1 text-sm font-medium text-neutral-600 dark:text-neutral-400">
                관련 블로그 포스트
            </p>
            <ul className="space-y-1">
                {posts.map((post) => (
                    <li key={post.slug}>
                        <a
                            href={`/blog/${post.slug}`}
                            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                        >
                            -&gt; {post.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}
