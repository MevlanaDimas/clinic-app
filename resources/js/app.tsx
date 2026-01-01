import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
// import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from '@/hooks/use-appearance';
import { PageLoading } from '@/components/page-loading';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: name => {
        const pages = import.meta.glob('./pages/**/*.tsx');
        const page = pages[`./pages/${name}.tsx`];

        if (!page) {
            throw new Error(`Unknown page: ${name}.`);
        }

        return lazy(() => page());
    },
    // resolve: (name) =>
    //     resolvePageComponent(
    //         `./pages/${name}.tsx`,
    //         import.meta.glob('./pages/**/*.tsx'),
    //     ),
    setup({ el, App, props }) {
        createRoot(el).render(
            <Suspense fallback={<PageLoading />}>
                <App {...props} />
            </Suspense>
        );
    },
    // setup({ el, App, props }) {
    //     const root = createRoot(el);

    //     root.render(<App {...props} />);
    // },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
