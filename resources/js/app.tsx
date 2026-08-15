import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { route, Config } from 'ziggy-js';
import { ThemeProvider } from './context/ThemeContext';
import { AppWrapper } from './components/common/PageMeta';
import '../css/app.css';
import 'swiper/swiper-bundle.css';
import 'flatpickr/dist/flatpickr.css';

// Make route() available globally — use window.Ziggy injected by @routes (has correct port)
(window as any).route = (name: string, params?: any, absolute?: boolean) =>
    route(name, params, absolute, (window as any).Ziggy as Config);

createInertiaApp({
    resolve: (name: string) => {
        const pages = import.meta.glob('./Pages/**/*.tsx', { eager: true }) as Record<
            string,
            { default: React.ComponentType }
        >;
        return pages[`./Pages/${name}.tsx`];
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <React.StrictMode>
                <ThemeProvider>
                    <AppWrapper>
                        <App {...props} />
                    </AppWrapper>
                </ThemeProvider>
            </React.StrictMode>
        )
    },
});