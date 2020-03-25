/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v23.0.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Bean } from "../context/context";
var CellPositionUtils = /** @class */ (function () {
    function CellPositionUtils() {
    }
    CellPositionUtils.prototype.createId = function (cellPosition) {
        var rowIndex = cellPosition.rowIndex, rowPinned = cellPosition.rowPinned, column = cellPosition.column;
        return this.createIdFromValues(rowIndex, column, rowPinned);
    };
    CellPositionUtils.prototype.createIdFromValues = function (rowIndex, column, rowPinned) {
        return rowIndex + "." + (rowPinned == null ? 'null' : rowPinned) + "." + column.getId();
    };
    CellPositionUtils.prototype.equals = function (cellA, cellB) {
        var colsMatch = cellA.column === cellB.column;
        var floatingMatch = cellA.rowPinned === cellB.rowPinned;
        var indexMatch = cellA.rowIndex === cellB.rowIndex;
        return colsMatch && floatingMatch && indexMatch;
    };
    CellPositionUtils = __decorate([
        Bean('cellPositionUtils')
    ], CellPositionUtils);
    return CellPositionUtils;
}());
export { CellPositionUtils };