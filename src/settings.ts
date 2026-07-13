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

export class SampleSettingTab extends PluginSettingTab {
	plugin: OpenAlephPlugin;

	constructor(app: App, plugin: OpenAlephPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('API Key')
			.setDesc(
				'Put API Secret Access Key from https://your-openaleph-instance/settings',
			)
			.addText((text) =>
				text
					.setPlaceholder('where does this placeholder go?')
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName('API URL')
			.setDesc('Your OpenAleph Instance')
			.addText((text) =>
				text
					.setPlaceholder('where does this placeholder go?')
					.setValue(this.plugin.settings.instanceUrl)
					.onChange(async (value) => {
						this.plugin.settings.instanceUrl = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
