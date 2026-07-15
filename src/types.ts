export interface ResizableSidebarSplit {
    collapsed: boolean;
    size: number;
    containerEl: HTMLElement;
    setSize(size: number): void;
    expand(): void;
    collapse(): void;
}