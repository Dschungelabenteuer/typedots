import type { Payload } from './common';

export class InvalidPathError extends Error {
  public targetPath: string;

  constructor(
    public payload: Payload,
    reason: string
  ) {
    const hint = `(target path was: ${payload.path})`;
    super(`Invalid path: ${reason}` + `\n ` + hint);
    this.name = 'InvalidPathError';
    this.targetPath = payload.path;
  }
}

export class SourceNotAnObjectError extends InvalidPathError {
  constructor(payload: Payload) {
    const hint = `(current path is: ${payload.currentPath})`;
    super(payload, `Source at current path is not an object` + `\n  ` + hint);
    this.name = 'SourceNotAnObjectError';
  }
}

export class UndefinedPropertyError extends InvalidPathError {
  constructor(payload: Payload) {
    super(payload, `Property "${payload.subpath}" does not exist on ${payload.currentPath}`);
    this.name = 'UndefinedPropertyError';
  }
}
