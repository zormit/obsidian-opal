import { ItemView, Notice, WorkspaceLeaf } from 'obsidian';
import { initOpenAleph } from './utils';
import { OpenAlephClient } from './openaleph';
import OpenAlephPlugin from './main';

export const VIEW_TYPE_OPENALEPH_SEARCH = 'openaleph-search-view';

export class OpenAlephSearchView extends ItemView {
    private plugin: OpenAlephPlugin;
    private inputEl!: HTMLInputElement;
    private resultsEl!: HTMLElement;
    // private settings!: OpenAlephPluginSettings;
    // private openAlephClient!: OpenAlephClient;

    constructor(leaf: WorkspaceLeaf, plugin: OpenAlephPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return VIEW_TYPE_OPENALEPH_SEARCH;
    }

    getDisplayText(): string {
        return 'Federated OpenAleph search';
    }

    getIcon(): string {
        return 'binoculars';
    }

    async onOpen(): Promise<void> {
        const container = this.contentEl;
        container.empty();
        container.addClass('openaleph-search-container');

        const searchRow = container.createDiv({ cls: 'openaleph-search-row' });

        this.inputEl = searchRow.createEl('input', {
            type: 'text',
            placeholder: 'Vladimir Putin',
            cls: 'openaleph-search-input',
        });

        const searchBtn = searchRow.createEl('button', { text: 'Search' });

        this.resultsEl = container.createDiv({ cls: 'openaleph-results' });

        searchBtn.onclick = () => this.handleSearch();
        this.inputEl.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') this.handleSearch();
        });
    }

    async onClose(): Promise<void> {
        // Nothing to clean up.
    }

    private async handleSearch(): Promise<void> {
        const query = this.inputEl.value.trim();
        if (!query) return;

        // TODO check that there is at least one OpenAleph instance set in the settings

        this.resultsEl.empty();

        // TODO only init once and reuse, don't init per search
        const apiClient: OpenAlephClient = await initOpenAleph(this.plugin);
        const results = await apiClient.search(query);

        if (results.status === 'ok') {
            // TODO format nicely
            const total = results.total;
            if (total) {
                this.resultsEl.createEl('div', { text: `Found ${total} results`, cls: 'openaleph-results-total' })
                for (const entry of results.results) {
                    this.resultsEl.createEl('div', {
                        text: 'search.openaleph.org',
                        cls: 'openaleph-source-heading',
                    });
                    const item = this.resultsEl.createDiv({ cls: 'openaleph-result-item' });
                    item.createEl('div', { text: entry.caption, cls: 'openaleph-result-title' });
                    item.createEl('div', { text: entry.schema, cls: 'openaleph-result-snippet' });
                    const actions = item.createDiv({ cls: 'openaleph-result-actions' });
                    const importBtn = actions.createEl('button', { text: 'Import as note' });
                    importBtn.onclick = async () => {
                        //  TODO
                    };
                }
            } else {
                this.resultsEl.createEl('div', { text: 'No results found.', cls: 'openaleph-empty-state' });
            }
        } else {
            this.resultsEl.createEl('div', {
                text: `No results found`,
                cls: 'openaleph-error',
            });
        }
    }
}
