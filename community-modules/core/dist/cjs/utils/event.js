/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v24.0.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var array_1 = require("./array");
var AG_GRID_STOP_PROPAGATION = '__ag_Grid_Stop_Propagation';
var PASSIVE_EVENTS = ['touchstart', 'touchend', 'touchmove', 'touchcancel'];
var OUTSIDE_ANGULAR_EVENTS = ['mouseover', 'mouseout', 'mouseenter', 'mouseleave'];
var supports = {};
/**
 * a user once raised an issue - they said that when you opened a popup (eg context menu)
 * and then clicked on a selection checkbox, the popup wasn't closed. this is because the
 * popup listens for clicks on the body, however ag-grid WAS stopping propagation on the
 * checkbox clicks (so the rows didn't pick them up as row selection selection clicks).
 * to get around this, we have a pattern to stop propagation for the purposes of ag-Grid,
 * but we still let the event pass back to the body.
 * @param {Event} event
 */
function stopPropagationForAgGrid(event) {
    event[AG_GRID_STOP_PROPAGATION] = true;
}
exports.stopPropagationForAgGrid = stopPropagationForAgGrid;
function isStopPropagationForAgGrid(event) {
    return event[AG_GRID_STOP_PROPAGATION] === true;
}
exports.isStopPropagationForAgGrid = isStopPropagationForAgGrid;
exports.isEventSupported = (function () {
    var tags = {
        select: 'input',
        change: 'input',
        submit: 'form',
        reset: 'form',
        error: 'img',
        load: 'img',
        abort: 'img'
    };
    var isEventSupported = function (eventName) {
        if (typeof supports[eventName] === 'boolean') {
            return supports[eventName];
        }
        var el = document.createElement(tags[eventName] || 'div');
        eventName = 'on' + eventName;
        var isSupported = (eventName in el);
        if (!isSupported) {
            el.setAttribute(eventName, 'return;');
            isSupported = typeof el[eventName] == 'function';
        }
        el = null;
        return supports[eventName] = isSupported;
    };
    return isEventSupported;
})();
function getCellCompForEvent(gridOptionsWrapper, event) {
    var sourceElement = getTarget(event);
    while (sourceElement) {
        var renderedCell = gridOptionsWrapper.getDomData(sourceElement, 'cellComp');
        if (renderedCell) {
            return renderedCell;
        }
        sourceElement = sourceElement.parentElement;
    }
    return null;
}
exports.getCellCompForEvent = getCellCompForEvent;
/**
 * @deprecated
 * Adds all type of change listeners to an element, intended to be a text field
 * @param {HTMLElement} element
 * @param {EventListener} listener
 */
function addChangeListener(element, listener) {
    element.addEventListener('changed', listener);
    element.addEventListener('paste', listener);
    element.addEventListener('input', listener);
    // IE doesn't fire changed for special keys (eg delete, backspace), so need to
    // listen for this further ones
    element.addEventListener('keydown', listener);
    element.addEventListener('keyup', listener);
}
exports.addChangeListener = addChangeListener;
/**
 * srcElement is only available in IE. In all other browsers it is target
 * http://stackoverflow.com/questions/5301643/how-can-i-make-event-srcelement-work-in-firefox-and-what-does-it-mean
 * @param {Event} event
 * @returns {Element}
 */
function getTarget(event) {
    var eventNoType = event;
    return eventNoType.target || eventNoType.srcElement;
}
exports.getTarget = getTarget;
function isElementInEventPath(element, event) {
    if (!event || !element) {
        return false;
    }
    return getEventPath(event).indexOf(element) >= 0;
}
exports.isElementInEventPath = isElementInEventPath;
function createEventPath(event) {
    var res = [];
    var pointer = getTarget(event);
    while (pointer) {
        res.push(pointer);
        pointer = pointer.parentElement;
    }
    return res;
}
exports.createEventPath = createEventPath;
/**
 * firefox doesn't have event.path set, or any alternative to it, so we hack
 * it in. this is needed as it's to late to work out the path when the item is
 * removed from the dom. used by MouseEventService, where it works out if a click
 * was from the current grid, or a detail grid (master / detail).
 * @param {Event} event
 */
function addAgGridEventPath(event) {
    event.__agGridEventPath = getEventPath(event);
}
exports.addAgGridEventPath = addAgGridEventPath;
/**
 * Gets the path for an Event.
 * https://stackoverflow.com/questions/39245488/event-path-undefined-with-firefox-and-vue-js
 * https://developer.mozilla.org/en-US/docs/Web/API/Event
 * @param {Event} event
 * @returns {EventTarget[]}
 */
function getEventPath(event) {
    var eventNoType = event;
    if (eventNoType.deepPath) {
        // IE supports deep path
        return eventNoType.deepPath();
    }
    if (eventNoType.path) {
        // Chrome supports path
        return eventNoType.path;
    }
    if (eventNoType.composedPath) {
        // Firefox supports composePath
        return eventNoType.composedPath();
    }
    if (eventNoType.__agGridEventPath) {
        // Firefox supports composePath
        return eventNoType.__agGridEventPath;
    }
    // and finally, if none of the above worked,
    // we create the path ourselves
    return createEventPath(event);
}
exports.getEventPath = getEventPath;
function addSafePassiveEventListener(frameworkOverrides, eElement, event, listener) {
    var isPassive = array_1.includes(PASSIVE_EVENTS, event);
    var isOutsideAngular = array_1.includes(OUTSIDE_ANGULAR_EVENTS, event);
    var options = isPassive ? { passive: true } : undefined;
    if (isOutsideAngular) {
        // this happens in certain scenarios where I believe the user must be destroying the grid somehow but continuing
        // for it to be used
        // don't fall through to the else part either - just don't add the listener
        if (frameworkOverrides && frameworkOverrides.addEventListenerOutsideAngular) {
            frameworkOverrides.addEventListenerOutsideAngular(eElement, event, listener, options);
        }
    }
    else {
        eElement.addEventListener(event, listener, options);
    }
}
exports.addSafePassiveEventListener = addSafePassiveEventListener;

//# sourceMappingURL=event.js.map
