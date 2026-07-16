import { Plugin, WorkspaceLeaf, Notice } from 'obsidian';
import { DEFAULT_SETTINGS, OpenAlephSettingTab } from './settings';
import { OpenAlephSearchView, VIEW_TYPE_OPENALEPH_SEARCH } from './view';
import type { ResizableSidebarSplit } from './types';
import type { OpenAlephPluginSettings } from './openaleph';
// import { initOpenAleph } from './utils'

export default class OpenAlephPlugin extends Plugin {
	// openAlephClient!: OpenAlephClient;
	settings!: OpenAlephPluginSettings;

	async onload() {
		await this.loadSettings();
		// await this.initOpenAleph();

		// The second argument to registerView() is a factory function that returns an instance of the view you want to register.
		this.registerView(
			VIEW_TYPE_OPENALEPH_SEARCH,
			(leaf) => new OpenAlephSearchView(leaf, this),
		);

		this.registerEvent(
			this.app.workspace.on('active-leaf-change', (leaf) => {
				if (leaf?.view.getViewType() === VIEW_TYPE_OPENALEPH_SEARCH) {
					this.ensureMinSidebarWidth();
				}
			}),
		);

		this.addRibbonIcon(
			'binoculars',
			// eslint-disable-next-line obsidianmd/ui/sentence-case -- This is in proper sentence case.
			'OpenAleph Search',
			(_evt: MouseEvent) => {
				this.activateView().catch((err) => {
					// eslint-disable-next-line obsidianmd/ui/sentence-case -- This is in proper sentence case.
					new Notice('Could not open the OpenAleph Search plugin');
				});
			},
		);

		this.addCommand({
			id: 'open-openaleph-search',
			name: 'Open search view',
			callback: () => this.activateView(),
		});

		// implement a Test for connections in Settings
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText(
		// 	`Connection to OpenAleph API: ${await this.openAlephClient.instanceStatus()}`,
		// );

		this.addSettingTab(new OpenAlephSettingTab(this.app, this));
	}

	onunload() {}

	// implementation from obsidian-sample-plugin
	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<OpenAlephPluginSettings>,
		);
	}

	// implementation from obsidian-sample-plugin
	async saveSettings() {
		await this.saveData(this.settings);
	}

	async activateView(): Promise<void> {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null =
			workspace.getLeavesOfType(VIEW_TYPE_OPENALEPH_SEARCH)[0] ?? null;

		if (!leaf) {
			leaf = workspace.getLeftLeaf(false);
			if (!leaf) return;
			await leaf.setViewState({
				type: VIEW_TYPE_OPENALEPH_SEARCH,
				active: true,
			});
		}

		// two assertions, as per TypeScript doc https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions
		const leftSplit =
			workspace.leftSplit as unknown as ResizableSidebarSplit;

		if (leftSplit?.collapsed) {
			leftSplit.expand();
		}

		await workspace.revealLeaf(leaf);

		this.ensureMinSidebarWidth();
	}

	// adding the search icon to the left view requires us to resize the view
	// in order to make room for the search bar and search icon
	private ensureMinSidebarWidth(): void {
		const leftSplit = this.app.workspace
			.leftSplit as unknown as ResizableSidebarSplit;
		// setSize is deduced from decompiled Obsidian code, not in the official docs
		// https://forum.obsidian.md/t/change-left-sidebar-width/80126/4
		if (!leftSplit || typeof leftSplit.setSize !== 'function') return;

		const MIN_WIDTH = 300;
		const containerEl: HTMLElement | undefined = leftSplit.containerEl;

		const applyWidth = () => {
			const currentWidth =
				containerEl?.getBoundingClientRect().width ?? 0;
			if (currentWidth < MIN_WIDTH) {
				leftSplit.setSize(MIN_WIDTH);
			}
		};

		if (leftSplit.collapsed) {
			leftSplit.expand();
		}

		if (!containerEl) {
			applyWidth();
			return;
		}

		// `transitioned` CSS event: https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event
		let done = false;
		const onTransitionEnd = () => {
			if (done) return;
			done = true;
			containerEl.removeEventListener('transitionend', onTransitionEnd);
			applyWidth();
		};

		containerEl.addEventListener('transitionend', onTransitionEnd);

		window.setTimeout(() => {
			if (!done) {
				done = true;
				containerEl.removeEventListener(
					'transitionend',
					onTransitionEnd,
				);
				applyWidth();
			}
		}, 250);
	}
}
