'use client';

import { MDXProvider as BaseMDXProvider } from '@mdx-js/react';
import { ReactNode } from 'react';
import { mdxComponents } from './MDXComponents';

interface MDXProviderProps {
  children: ReactNode;
  components?: Record<string, React.ComponentType<unknown>>;
}

export function MDXProvider({ children, components = {} }: MDXProviderProps) {
  const mergedComponents = {
    ...mdxComponents,
    ...components,
  };

  return (
    <BaseMDXProvider components={mergedComponents}>
      {children}
    </BaseMDXProvider>
  );
}

export default MDXProvider;