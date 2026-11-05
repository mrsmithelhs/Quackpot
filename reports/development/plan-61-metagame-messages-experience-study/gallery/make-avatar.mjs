import {writeFileSync} from 'node:fs';
import {renderRen} from '../../../../src/assets/ren/index.mjs';
writeFileSync(new URL('./ren-avatar.svg',import.meta.url),renderRen({idPrefix:'plan61ren',framing:'avatar',decorative:true}).svg);
