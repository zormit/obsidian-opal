import {
	Editor,
	MarkdownView,
	MarkdownFileInfo,
	Modal,
	Notice,
	Plugin,
	requestUrl,
} from 'obsidian';
import {
	DEFAULT_SETTINGS,
	OpenAlephPluginSettings,
	SampleSettingTab,
} from './settings';

// Configures whether we want a fake static result for development or the real thing
// Defaults to false in development unless you set FAKE_API=false in the environment.
//
// Provided by esbuild.config.mjs
declare const USE_FAKE_API: boolean;

const REST_API = '/api/2/';
const METADATA_ENDPOINT = 'metadata';

export default class OpenAlephPlugin extends Plugin {
	settings!: OpenAlephPluginSettings;
	searchOpenAleph!: (query: string) => Promise<Object>;

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

		// TODO: hacky way of stitching the URL together
		const url = `${this.settings.instanceUrl}/${REST_API}/${METADATA_ENDPOINT}`;
		const headers = { 'User-Agent': 'alephclient' };
		let request = {
			url,
			headers,
		};
		let status = await requestUrl(request)
			.then((response) =>
				response.status === 200 ? 'available' : 'bad status',
			)
			.catch((err) => {
				console.error(err);
				return 'connection failed';
			});
		statusBarItemEl.setText(`Connection to OpenAleph API: ${status}`);

		console.log(
			await this.searchOpenAleph('Hendrik Riehmer').catch(
				(_err) => 'oops. Not implemented?',
			),
		);

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-modal-simple',
			name: 'Open modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
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
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
				return false;
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(activeDocument, 'click', (_evt: MouseEvent) => {
			new Notice('Click');
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000),
		);
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
		if (USE_FAKE_API) {
			console.info('using FAKE API');
			this.searchOpenAleph = (await import('./openaleph_fake')).search;
		} else {
			this.searchOpenAleph = (await import('./openaleph')).search;
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	onOpen() {
		const { contentEl } = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
