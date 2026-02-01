import { useEffect, useRef } from 'react';

export default function Giscus() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.setAttribute('data-repo', 'chan99k/chan99k.github.io');
        script.setAttribute('data-repo-id', 'R_kgDOQ8vEGQ');
        script.setAttribute('data-category', 'General');
        script.setAttribute('data-category-id', 'DIC_kwDOQ8vEGc4C1tdV');
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

        ref.current.innerHTML = '';
        ref.current.appendChild(script);
    }, []);

    return <div ref={ref} className="giscus mt-10" />;
}
