import { App, PluginSettingTab, Setting } from 'obsidian';
import OpenAlephPlugin from './main';

export interface OpenAlephPluginSettings {
	apiKey: string;
	instanceUrl: string;
}

export const DEFAULT_SETTINGS: OpenAlephPluginSettings = {
	apiKey: 'key',
	instanceUrl: 'https://search.openaleph.org',
};

// TODO: Migrate to https://docs.obsidian.md/plugins/guides/migrate-declarative-settings at some point.
//
// eslint-disable-next-line obsidianmd/settings-tab/prefer-setting-definitions -- We don't want to migrate now.
export class OpenAlephSettingTab extends PluginSettingTab {
	plugin: OpenAlephPlugin;

	constructor(app: App, plugin: OpenAlephPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		// TODO - allow the user to add multiple pairs of API key & instance URL
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('API key')
			.setDesc(
				// eslint-disable-next-line obsidianmd/ui/sentence-case -- This is in proper sentence case.
				'Put secret API access key from https://your-openaleph-instance/settings.',
			)
			.addText((text) =>
				text
					.setPlaceholder('Where does this placeholder go?')
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('API URL')
			// eslint-disable-next-line obsidianmd/ui/sentence-case -- OpenAleph is the correct spelling.
			.setDesc('Your OpenAleph instance.')
			.addText((text) =>
				text
					.setPlaceholder('Where does this placeholder go?')
					.setValue(this.plugin.settings.instanceUrl)
					.onChange(async (value) => {
						this.plugin.settings.instanceUrl = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
