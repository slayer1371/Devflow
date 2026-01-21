export interface InsertOp {
  type: 'insert';
  position: number;
  text: string;
  version: number;  // What version this op is based on
}

export interface DeleteOp {
  type: 'delete';
  position: number;
  length: number;
  version: number;
}

export interface ReplaceOp {
  type: 'replace';
  position: number;
  deleteLength: number;
  insertText: string;
  version: number;
}

export type Operation = InsertOp | DeleteOp | ReplaceOp;

// Transform opA against opB (opB happened first)
export function transform(opA: Operation, opB: Operation): Operation {
  // Insert vs Insert
    if(opA.type === 'insert' && opB.type === 'insert') {
        if (opB.position < opA.position) {
            return {
                ...opA,
                position: opA.position + opB.text.length
            }}
        return opA;
    }

    if(opA.type === 'insert' && opB.type === 'delete') {
    if (opB.position < opA.position) {
        return {
        ...opA,
        position :opA.position - opB.length
        }
    } 
    return opA;
}

    if(opA.type === 'delete' && opB.type === 'insert') {
    if (opB.position <= opA.position) {
        return {
        ...opA,
        position: opA.position + opB.text.length
        }
    } 
    return opA;
}

    if(opA.type === 'delete' && opB.type === 'delete') {
    if (opB.position < opA.position) {
        return {
        ...opA,
        position: opA.position - opB.length
        }
    }
    return opA;
    }

    if (opA.type === 'replace' && opB.type === 'insert') {
    if (opB.position <= opA.position) {
      return {
        ...opA,
        position: opA.position + opB.text.length
      };
    }
    return opA;
  }
  
  if (opA.type === 'replace' && opB.type === 'delete') {
    if (opB.position < opA.position) {
      return {
        ...opA,
        position: Math.max(opB.position, opA.position - opB.length)
      };
    }
    return opA;
  }
  
  if (opA.type === 'insert' && opB.type === 'replace') {
    if (opB.position <= opA.position) {
      return {
        ...opA,
        position: opA.position - opB.deleteLength + opB.insertText.length
      };
    }
    return opA;
  }
  
  if (opA.type === 'delete' && opB.type === 'replace') {
    if (opB.position <= opA.position) {
      return {
        ...opA,
        position: opA.position - opB.deleteLength + opB.insertText.length
      };
    }
    return opA;
  }
  
  if (opA.type === 'replace' && opB.type === 'replace') {
    // Complex case - transform position accounting for both delete and insert
    if (opB.position < opA.position) {
      return {
        ...opA,
        position: opA.position - opB.deleteLength + opB.insertText.length
      };
    }
    return opA;
  }

    return opA;
}