import { OpenAlephClient } from './openaleph';
import OpenAlephPlugin from './main';

// Configures whether we want a fake static result for development or the real thing
// Defaults to false in development unless you set FAKE_API=false in the environment.
//
// Provided by esbuild.config.mjs
declare const USE_FAKE_API: boolean;

export async function initOpenAleph(plugin: OpenAlephPlugin): Promise<OpenAlephClient> {
    const { settings } = plugin;

    const ClientConstructor = USE_FAKE_API
        ? (await import('./openaleph_fake')).default
        : (await import('./openaleph')).default;

    if (USE_FAKE_API) {
        console.info('using FAKE API');
    }

    return new ClientConstructor(
        settings.instanceUrl,
        settings.apiKey,
    );
}