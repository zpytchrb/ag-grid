import { GridOptionsWrapper } from '../gridOptionsWrapper';
import { AgEvent } from '../events';
import { AgAbstractInputField, IInputField } from './agAbstractInputField';
import { LabelAlignment } from './agAbstractLabel';
export interface ChangeEvent extends AgEvent {
    selected: boolean;
}
export declare class AgCheckbox extends AgAbstractInputField<HTMLInputElement, boolean> {
    protected readonly gridOptionsWrapper: GridOptionsWrapper;
    protected labelAlignment: LabelAlignment;
    private selected?;
    private readOnly;
    private passive;
    constructor(config?: IInputField, className?: string, inputType?: string);
    protected addInputListeners(): void;
    getNextValue(): boolean;
    setPassive(passive: boolean): void;
    isReadOnly(): boolean;
    setReadOnly(readOnly: boolean): void;
    setDisabled(disabled: boolean): this;
    toggle(): void;
    getValue(): boolean;
    setValue(value?: boolean, silent?: boolean): this;
    setName(name: string): this;
    protected isSelected(): boolean;
    private setSelected;
    protected dispatchChange(selected?: boolean, event?: MouseEvent): void;
    private onCheckboxClick;
    private refreshSelectedClass;
}
