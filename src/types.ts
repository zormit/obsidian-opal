export interface ResizableSidebarSplit {
    collapsed: boolean;
    size: number;
    containerEl: HTMLElement;
    setSize(size: number): void;
    expand(): void;
    collapse(): void;
}

export interface OpenAlephPluginSettings {
	importFolder: string;
	instances: OpenAlephInstanceSettings[];
}

export interface OpenAlephInstanceSettings {
	id: string;
	name: string;
	instanceUrl: string;
	apiKey: string;
	enabled: boolean;
}