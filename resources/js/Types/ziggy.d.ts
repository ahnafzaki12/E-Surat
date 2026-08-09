import { Config, Router } from 'ziggy-js';

declare global {
    function route(name: string, params?: object | string | number, absolute?: boolean, config?: Config): string;
}
