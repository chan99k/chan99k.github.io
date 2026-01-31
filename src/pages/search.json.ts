import { getCollection } from 'astro:content';

export async function GET() {
    const posts = await getCollection('blog');
    const projects = await getCollection('projects');

    const allContent = [
        ...posts.map((post) => ({
            title: post.data.title,
            description: post.data.description,
            slug: `/blog/${post.slug}`,
            type: 'Blog',
            date: post.data.pubDate,
        })),
        ...projects.map((project) => ({
            title: project.data.title,
            description: project.data.description,
            slug: `/projects/${project.slug}`,
            type: 'Project',
            date: project.data.pubDate,
        }))
    ].sort((a, b) => b.date.valueOf() - a.date.valueOf());

    return new Response(JSON.stringify(allContent), {
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
