import { App, PluginSettingTab, Setting } from 'obsidian';
import {
	OpenAlephInstanceSettings,
	OpenAlephPluginSettings,
} from './openaleph';
import OpenAlephPlugin from './main';

export const DEFAULT_INSTANCE: Omit<OpenAlephInstanceSettings, 'id'> = {
	apiKey: 'key',
	name: 'OpenAleph instance',
	instanceUrl: 'https://search.openaleph.org',
	enabled: true,
};

export const DEFAULT_SETTINGS: OpenAlephPluginSettings = {
	importFolder: 'followthemarkdown',
	instances: [],
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

		containerEl.createEl('h2', { text: 'OpenAleph federated search' });

		new Setting(containerEl)
			.setName('Follow the Money entity folder')
			.setDesc(
				'Importing a Follow the Money entity from an OpenAleph instance will save it here, as a Markdown note.',
			)
			.addText((text) =>
				text
					.setPlaceholder('followthemarkdown')
					.setValue(this.plugin.settings.importFolder)
					.onChange(async (value) => {
						this.plugin.settings.importFolder =
							value || 'followthemarkdown';
						await this.plugin.saveSettings();
					}),
			);

		containerEl.createEl('p', {
			text: 'Add the domain URL and API key for OpenAleph instances, in order to allow Obsidian to search scross them simultaneously.',
		});

		this.plugin.settings.instances.forEach((instance, index) => {
			this.renderInstance(containerEl, instance, index);
		});

		new Setting(containerEl).addButton((btn) =>
			btn
				.setButtonText('Add instance')
				.setCta()
				.onClick(async () => {
					const instance: OpenAlephInstanceSettings = {
						...DEFAULT_INSTANCE,
						id: crypto.randomUUID(),
					};
					this.plugin.settings.instances.push(instance);
					await this.plugin.saveSettings();
					this.display();
				}),
		);
	}

	private renderInstance(
		containerEl: HTMLElement,
		instance: OpenAlephInstanceSettings,
		index: number,
	): void {
		const box = containerEl.createDiv({ cls: 'openaleph-source-box' });

		new Setting(box)
			.setName(instance.name || `Instance ${index + 1}`)
			.setHeading()
			.addToggle((toggle) =>
				toggle.setValue(instance.enabled).onChange(async (value) => {
					instance.enabled = value;
					await this.plugin.saveSettings();
				}),
			)
			.addExtraButton((btn) =>
				btn
					.setIcon('trash')
					.setTooltip('Remove instance')
					.onClick(async () => {
						this.plugin.settings.instances.splice(index, 1);
						await this.plugin.saveSettings();
						this.display();
					}),
			);

		new Setting(box).setName('Name').addText((text) =>
			text.setValue(instance.name).onChange(async (value) => {
				instance.name = value;
				await this.plugin.saveSettings();
			}),
		);

		new Setting(box).setName('Instance domain').addText((text) =>
			text
				.setPlaceholder('https://search.openaleph.org')
				.setValue(instance.instanceUrl)
				.onChange(async (value) => {
					instance.instanceUrl = value;
					await this.plugin.saveSettings();
				}),
		);

		new Setting(box).setName('API key').addText((text) =>
			text
				.setPlaceholder('key')
				.setValue(instance.apiKey)
				.onChange(async (value) => {
					instance.apiKey = value;
					await this.plugin.saveSettings();
				}),
		);
	}
}
