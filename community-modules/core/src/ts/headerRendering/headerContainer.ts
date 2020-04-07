import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { Autowired, Context, PostConstruct, PreDestroy } from '../context/context';
import { DropTarget } from '../dragAndDrop/dragAndDropService';
import { ColumnController } from '../columnController/columnController';
import { GridPanel } from '../gridPanel/gridPanel';
import { EventService } from '../eventService';
import { Events } from '../events';
import { HeaderRowComp, HeaderRowType } from './headerRowComp';
import { BodyDropTarget } from './bodyDropTarget';
import { ScrollVisibleService } from '../gridPanel/scrollVisibleService';
import { Component } from '../widgets/component';
import { Constants } from '../constants';
import { setFixedWidth, clearElement } from '../utils/dom';

export class HeaderContainer {
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;
    @Autowired('context') private context: Context;
    @Autowired('columnController') private columnController: ColumnController;
    @Autowired('eventService') private eventService: EventService;
    @Autowired('scrollVisibleService') private scrollVisibleService: ScrollVisibleService;

    private eContainer: HTMLElement;
    private eViewport: HTMLElement;

    private headerRowComps: HeaderRowComp[] = [];

    private pinned: string;

    private scrollWidth: number;

    private dropTarget: DropTarget;

    private events: (() => void)[] = [];

    constructor(eContainer: HTMLElement, eViewport: HTMLElement, pinned: string) {
        this.eContainer = eContainer;
        this.pinned = pinned;
        this.eViewport = eViewport;
    }

    public registerGridComp(gridPanel: GridPanel): void {
        this.setupDragAndDrop(gridPanel);
    }

    public forEachHeaderElement(callback: (renderedHeaderElement: Component) => void): void {
        this.headerRowComps.forEach(headerRowComp => headerRowComp.forEachHeaderElement(callback));
    }

    @PostConstruct
    private init(): void {
        this.scrollWidth = this.gridOptionsWrapper.getScrollbarWidth();

        // if value changes, then if not pivoting, we at least need to change the label eg from sum() to avg(),
        // if pivoting, then the columns have changed
        this.events = [
            this.eventService.addEventListener(Events.EVENT_COLUMN_VALUE_CHANGED, this.onColumnValueChanged.bind(this)),
            this.eventService.addEventListener(Events.EVENT_COLUMN_ROW_GROUP_CHANGED, this.onColumnRowGroupChanged.bind(this)),
            this.eventService.addEventListener(Events.EVENT_GRID_COLUMNS_CHANGED, this.onGridColumnsChanged.bind(this)),
            this.eventService.addEventListener(Events.EVENT_SCROLL_VISIBILITY_CHANGED, this.onScrollVisibilityChanged.bind(this)),
            this.eventService.addEventListener(Events.EVENT_COLUMN_RESIZED, this.onColumnResized.bind(this)),
            this.eventService.addEventListener(Events.EVENT_DISPLAYED_COLUMNS_CHANGED, this.onDisplayedColumnsChanged.bind(this))
        ];
    }

    // if row group changes, that means we may need to add aggFuncs to the column headers,
    // if the grid goes from no aggregation (ie no grouping) to grouping
    private onColumnRowGroupChanged(): void {
        this.onGridColumnsChanged();
    }

    // if the agg func of a column changes, then we may need to update the agg func in columns header
    private onColumnValueChanged(): void {
        this.onGridColumnsChanged();
    }

    private onColumnResized(): void {
        this.setWidthOfPinnedContainer();
    }

    private onDisplayedColumnsChanged(): void {
        this.setWidthOfPinnedContainer();
    }

    private onScrollVisibilityChanged(): void {
        this.setWidthOfPinnedContainer();
    }

    private setWidthOfPinnedContainer(): void {
        const pinningLeft = this.pinned === Constants.PINNED_LEFT;
        const pinningRight = this.pinned === Constants.PINNED_RIGHT;
        const controller = this.columnController;
        const isRtl = this.gridOptionsWrapper.isEnableRtl();

        if (pinningLeft || pinningRight) {
            // size to fit all columns
            let width = controller[pinningLeft ? 'getPinnedLeftContainerWidth' : 'getPinnedRightContainerWidth']();

            // if there is a scroll showing (and taking up space, so Windows, and not iOS)
            // in the body, then we add extra space to keep header aligned with the body,
            // as body width fits the cols and the scrollbar
            const addPaddingForScrollbar = this.scrollVisibleService.isVerticalScrollShowing() && ((isRtl && pinningLeft) || (!isRtl && pinningRight));

            if (addPaddingForScrollbar) {
                width += this.scrollWidth;
            }

            setFixedWidth(this.eContainer, width);
        }
    }

    @PreDestroy
    public destroy(): void {
        this.removeHeaderRowComps();

        if (this.events.length) {
            this.events.forEach(func => func());
            this.events = [];
        }
    }

    public getRowComps(): HeaderRowComp[] {
        return this.headerRowComps;
    }

    // grid cols have changed - this also means the number of rows in the header can have
    // changed. so we remove all the old rows and insert new ones for a complete refresh
    private onGridColumnsChanged() {
        this.removeAndCreateAllRowComps();
    }

    private removeAndCreateAllRowComps(): void {
        this.removeHeaderRowComps();
        this.createHeaderRowComps();
    }

    // we expose this for gridOptions.api.refreshHeader() to call
    public refresh(): void {
        this.removeAndCreateAllRowComps();
    }

    private setupDragAndDrop(gridComp: GridPanel): void {
        const dropContainer = this.eViewport ? this.eViewport : this.eContainer;
        const bodyDropTarget = new BodyDropTarget(this.pinned, dropContainer);
        this.context.wireBean(bodyDropTarget);
        bodyDropTarget.registerGridComp(gridComp);
    }

    private removeHeaderRowComps(): void {
        this.headerRowComps.forEach(headerRowComp => headerRowComp.destroy());
        this.headerRowComps.length = 0;

        clearElement(this.eContainer);
    }

    private createHeaderRowComps(): void {
        // if we are displaying header groups, then we have many rows here.
        // go through each row of the header, one by one.
        const rowCount = this.columnController.getHeaderRowCount();

        for (let dept = 0; dept < rowCount; dept++) {
            const groupRow = dept !== (rowCount - 1);
            const type = groupRow ? HeaderRowType.COLUMN_GROUP : HeaderRowType.COLUMN;
            const headerRowComp = new HeaderRowComp(dept, type, this.pinned, this.dropTarget);
            this.context.wireBean(headerRowComp);
            this.headerRowComps.push(headerRowComp);
            headerRowComp.getGui().setAttribute('aria-rowindex', this.headerRowComps.length.toString());
            this.eContainer.appendChild(headerRowComp.getGui());
        }

        if (!this.columnController.isPivotMode() && this.columnController.hasFloatingFilters()) {
            const headerRowComp = new HeaderRowComp(rowCount, HeaderRowType.FLOATING_FILTER, this.pinned, this.dropTarget);
            this.context.wireBean(headerRowComp);
            this.headerRowComps.push(headerRowComp);
            headerRowComp.getGui().setAttribute('aria-rowindex', this.headerRowComps.length.toString());
            this.eContainer.appendChild(headerRowComp.getGui());
        }
    }
}