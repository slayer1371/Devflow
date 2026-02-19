"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = transform;
// Transform opA against opB (opB happened first)
function transform(opA, opB) {
    // Insert vs Insert
    if (opA.type === 'insert' && opB.type === 'insert') {
        if (opB.position < opA.position) {
            return Object.assign(Object.assign({}, opA), { position: opA.position + opB.text.length });
        }
        return opA;
    }
    if (opA.type === 'insert' && opB.type === 'delete') {
        if (opB.position < opA.position) {
            return Object.assign(Object.assign({}, opA), { position: opA.position - opB.length });
        }
        return opA;
    }
    if (opA.type === 'delete' && opB.type === 'insert') {
        if (opB.position <= opA.position) {
            return Object.assign(Object.assign({}, opA), { position: opA.position + opB.text.length });
        }
        return opA;
    }
    if (opA.type === 'delete' && opB.type === 'delete') {
        if (opB.position < opA.position) {
            return Object.assign(Object.assign({}, opA), { position: opA.position - opB.length });
        }
        return opA;
    }
    if (opA.type === 'replace' && opB.type === 'insert') {
        if (opB.position <= opA.position) {
            return Object.assign(Object.assign({}, opA), { position: opA.position + opB.text.length });
        }
        return opA;
    }
    if (opA.type === 'replace' && opB.type === 'delete') {
        if (opB.position < opA.position) {
            return Object.assign(Object.assign({}, opA), { position: Math.max(opB.position, opA.position - opB.length) });
        }
        return opA;
    }
    if (opA.type === 'insert' && opB.type === 'replace') {
        if (opB.position <= opA.position) {
            return Object.assign(Object.assign({}, opA), { position: opA.position - opB.deleteLength + opB.insertText.length });
        }
        return opA;
    }
    if (opA.type === 'delete' && opB.type === 'replace') {
        if (opB.position <= opA.position) {
            return Object.assign(Object.assign({}, opA), { position: opA.position - opB.deleteLength + opB.insertText.length });
        }
        return opA;
    }
    if (opA.type === 'replace' && opB.type === 'replace') {
        // Complex case - transform position accounting for both delete and insert
        if (opB.position < opA.position) {
            return Object.assign(Object.assign({}, opA), { position: opA.position - opB.deleteLength + opB.insertText.length });
        }
        return opA;
    }
    return opA;
}
