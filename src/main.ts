import {
	Editor,
	MarkdownView,
	MarkdownFileInfo,
	Modal,
	Notice,
	Plugin,
} from 'obsidian';
import {
	DEFAULT_SETTINGS,
	OpenAlephPluginSettings,
	OpenAlephSettingTab,
} from './settings';
import { OpenAlephClient } from './openaleph';

// Configures whether we want a fake static result for development or the real thing
// Defaults to false in development unless you set FAKE_API=false in the environment.
//
// Provided by esbuild.config.mjs
declare const USE_FAKE_API: boolean;

export default class OpenAlephPlugin extends Plugin {
	settings!: OpenAlephPluginSettings;
	openAlephClient!: OpenAlephClient;

	async onload() {
		await this.loadSettings();
		await this.initOpenAleph();

		// This creates an icon in the left ribbon.
		this.addRibbonIcon('dice', 'Sample', (_evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();

		statusBarItemEl.setText(
			`Connection to OpenAleph API: ${await this.openAlephClient.instanceStatus()}`,
		);

		await this.openAlephClient
			.search('Hendrik Riehmer')
			.then((res) => {
				console.log(res.status);
				console.log(res.results[0]?.getCaption());
			})
			.catch((err) => `Open Aleph search request failed with ${err}`);

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-modal-simple',
			name: 'Open modal (simple)',
			callback: () => {
				new OpenAlephModal(this.app).open();
			},
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'replace-selected',
			name: 'Replace selected content',
			editorCallback: (
				editor: Editor,
				_ctx: MarkdownView | MarkdownFileInfo,
			) => {
				editor.replaceSelection('Sample editor command');
			},
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-modal-complex',
			name: 'Open modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new OpenAlephModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
				return false;
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new OpenAlephSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<OpenAlephPluginSettings>,
		);
	}

	async initOpenAleph() {
		let ClientConstructor;
		if (USE_FAKE_API) {
			console.info('using FAKE API');
			ClientConstructor = (await import('./openaleph_fake')).default;
		} else {
			ClientConstructor = (await import('./openaleph')).default;
		}
		this.openAlephClient = new ClientConstructor(
			this.settings.instanceUrl,
			this.settings.apiKey,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class OpenAlephModal extends Modal {
	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
