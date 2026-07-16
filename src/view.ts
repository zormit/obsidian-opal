import { ItemView, Notice, WorkspaceLeaf } from 'obsidian';
import { initOpenAleph } from './utils';
import { OpenAlephClient } from './openaleph';
import OpenAlephPlugin from './main';

export const VIEW_TYPE_OPENALEPH_SEARCH = 'openaleph-search-view';

export class OpenAlephSearchView extends ItemView {
    private plugin: OpenAlephPlugin;
    private inputEl!: HTMLInputElement;
    private resultsEl!: HTMLElement;

    constructor(leaf: WorkspaceLeaf, plugin: OpenAlephPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType(): string {
        return VIEW_TYPE_OPENALEPH_SEARCH;
    }

    getDisplayText(): string {
        // eslint-disable-next-line obsidianmd/ui/sentence-case -- This is in proper sentence case.
        return 'Federated OpenAleph search';
    }

    getIcon(): string {
        return 'binoculars';
    }

    async onOpen(): Promise<void> {
        console.log(Math.floor(Math.random() * Date.now()).toString(36));
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
            // TODO make that Notice message more useful
            // eslint-disable-next-line obsidianmd/ui/sentence-case -- This is in proper sentence case.
            if (evt.key === 'Enter') this.handleSearch().catch((err) => new Notice('OpenAleph search failed.'));
        });
    }

    async onClose(): Promise<void> {
        // Nothing to clean up.
    }

    private async handleSearch(): Promise<void> {
        const query = this.inputEl.value.trim();
        if (!query) return;

        const enabledInstances = this.plugin.settings.instances.filter((instance) => instance.enabled);
        if (enabledInstances.length === 0) {
            new Notice("There are no enabled OpenAleph instances.");
            return; 
        }

        this.resultsEl.empty();
        
        // TODO RESUME HERE
        enabledInstances.map((instance) => {
            const apiClient: OpenAlephClient = await initOpenAleph(this.plugin);
            const results = await apiClient.search(query);

                    if (results.status === 'ok') {
            // TODO format nicely
            const total = results.total;
            if (total) {
                this.resultsEl.createDiv({ text: `Found ${total} results`, cls: 'openaleph-results-total' })
                for (const entry of results.results) {
                    this.resultsEl.createDiv({
                        text: 'search.openaleph.org',
                        cls: 'openaleph-source-heading',
                    });
                    const item = this.resultsEl.createDiv({ cls: 'openaleph-result-item' });
                    item.createDiv({ text: entry.caption || 'Untitled', cls: 'openaleph-result-title' });
                    item.createDiv({ text: entry.schema.toString() || 'Thing', cls: 'openaleph-result-snippet' });
                    const actions = item.createDiv({ cls: 'openaleph-result-actions' });
                    const importBtn = actions.createEl('button', { text: 'Import as note' });
                    importBtn.onclick = async () => {
                        //  TODO
                    };
                }
            } else {
                this.resultsEl.createDiv({ text: 'No results found.', cls: 'openaleph-empty-state' });
            }
        } else {
            this.resultsEl.createDiv({
                text: `No results found`,
                cls: 'openaleph-error',
            });
        }
        })
    }
}
