import { ItemView, Notice, WorkspaceLeaf } from 'obsidian';
import type OpenAlephPlugin from './main';

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

        const runSearch = () => this.handleSearch();
        searchBtn.onclick = runSearch;
        this.inputEl.addEventListener('keydown', (evt) => {
            if (evt.key === 'Enter') runSearch();
        });
    }

    async onClose(): Promise<void> {
        // Nothing to clean up.
    }

    //  TODO search
}
