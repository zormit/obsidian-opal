import { ItemView, Notice, WorkspaceLeaf } from 'obsidian';
import {
	SearchEndpoint as OpenAlephSearch,
	default as openAlephClientFactory,
} from './openaleph';
import OpenAlephPlugin from './main';

export const VIEW_TYPE_OPENALEPH_SEARCH = 'openaleph-search-view';

export class OpenAlephSearchView extends ItemView {
	private plugin: OpenAlephPlugin;
	private inputEl!: HTMLInputElement;
	private resultsEl!: HTMLElement;
	private personFilterCheckbox!: HTMLInputElement;

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
		const facetDummy = container.createDiv({ cls: 'openaleph-facets' });
		const personFilter = facetDummy.createEl('label', {
			// eslint-disable-next-line obsidianmd/ui/sentence-case -- This is in proper sentence case.
			attr: { title: 'Filter for Person' },
		});
		this.personFilterCheckbox = personFilter.createEl('input', {
			type: 'checkbox',
		});

		this.resultsEl = container.createDiv({ cls: 'openaleph-results' });

		searchBtn.onclick = () => this.handleSearch();
		this.inputEl.addEventListener('keydown', (evt) => {
			// TODO make that Notice message more useful
			if (evt.key === 'Enter')
				this.handleSearch().catch(
					// eslint-disable-next-line obsidianmd/ui/sentence-case -- This is in proper sentence case.
					(err) => new Notice('OpenAleph search failed.'),
				);
		});
	}

	async onClose(): Promise<void> {
		// Nothing to clean up.
	}

	private async handleSearch(): Promise<void> {
		const query = this.inputEl.value.trim();
		const filterForPerson = this.personFilterCheckbox.checked;
		if (!query) return;

		// const enabledInstances = this.plugin.settings.instances.filter(
		// 	(instance) => instance.enabled,
		// );
		// if (enabledInstances.length === 0) {
		// 	new Notice('There are no enabled OpenAleph instances.');
		// 	return;
		// }

		this.resultsEl.empty();
		const ClientFactory = openAlephClientFactory();
		const apiClient = new ClientFactory(this.plugin.settings);
		const search = new OpenAlephSearch(query);
		if (filterForPerson) {
			search.filter('Person');
		}
		const results = await apiClient.search(search);

		// TODO format nicely
		const total = results.total;
		if (total) {
			this.resultsEl.createDiv({
				text: `Found ${total} results`,
				cls: 'openaleph-results-total',
			});
			for (const [instanceId, instanceResults] of Object.entries(
				results.resultsForInstance,
			)) {
				const instanceSettings = apiClient.settingsById[instanceId];

				for (const entry of instanceResults.results) {
					this.resultsEl.createDiv({
						text: instanceSettings?.name || 'unknown instance',
						cls: 'openaleph-source-heading',
					});
					const item = this.resultsEl.createDiv({
						cls: 'openaleph-result-item',
					});
					item.createDiv({
						text: entry.caption || 'Untitled',
						cls: 'openaleph-result-title',
					});
					item.createDiv({
						text: entry.schema.toString() || 'Thing',
						cls: 'openaleph-result-snippet',
					});
					const actions = item.createDiv({
						cls: 'openaleph-result-actions',
					});
					const importBtn = actions.createEl('button', {
						text: 'Import as note',
					});
					importBtn.onclick = async () => {
						//  TODO
					};
				}
			}
		} else {
			this.resultsEl.createDiv({
				text: 'No results found.',
				cls: 'openaleph-empty-state',
			});
		}
	}
}
