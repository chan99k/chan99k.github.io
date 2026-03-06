import { useEffect, useRef } from 'react';
import { SITE } from '../config/site';

export default function Giscus() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.setAttribute('data-repo', SITE.giscus.repo);
        script.setAttribute('data-repo-id', SITE.giscus.repoId);
        script.setAttribute('data-category', SITE.giscus.category);
        script.setAttribute('data-category-id', SITE.giscus.categoryId);
        script.setAttribute('data-mapping', 'url');
        script.setAttribute('data-strict', '0');
        script.setAttribute('data-reactions-enabled', '1');
        script.setAttribute('data-emit-metadata', '0');
        script.setAttribute('data-input-position', 'top');
        script.setAttribute('data-theme', localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');
        script.setAttribute('data-lang', 'ko');
        script.setAttribute('data-loading', 'lazy');
        script.setAttribute('crossorigin', 'anonymous');
        script.async = true;

        ref.current.replaceChildren(script);
    }, []);

    return <div ref={ref} className="giscus mt-10" />;
}
