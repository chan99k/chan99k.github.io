import { useEffect, useRef } from 'react';

export default function Giscus() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        const script = document.createElement('script');
        script.src = 'https://giscus.app/client.js';
        script.setAttribute('data-repo', 'chan99k/chan99k.github.io');
        script.setAttribute('data-repo-id', 'R_kgDOMu8_'); // Placeholder
        script.setAttribute('data-category', 'General');
        script.setAttribute('data-category-id', 'DIC_kwDOMu8_'); // Placeholder
        script.setAttribute('data-mapping', 'pathname');
        script.setAttribute('data-strict', '0');
        script.setAttribute('data-reactions-enabled', '1');
        script.setAttribute('data-emit-metadata', '0');
        script.setAttribute('data-input-position', 'bottom');
        script.setAttribute('data-theme', localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');
        script.setAttribute('data-lang', 'ko');
        script.setAttribute('crossorigin', 'anonymous');
        script.async = true;

        ref.current.innerHTML = '';
        ref.current.appendChild(script);
    }, []);

    return <div ref={ref} className="giscus mt-10" />;
}
