// Copy the stub templates into build/ so the published package ships them.
// stubsRoot is resolved relative to the compiled files at runtime.
import {cp} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
await cp(`${root}/stubs`, `${root}/build/stubs`, {recursive: true});
