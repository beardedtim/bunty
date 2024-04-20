import path from 'path'

// This is the root of the _project_, including
// the source, dist, config, etc
export const PROJECT_ROOT_DIR = path.resolve(__dirname, '..')
export const SRC_DIR = path.join(PROJECT_ROOT_DIR, 'src')
export const DIST_DIR = path.join(PROJECT_ROOT_DIR, 'dist')
export const PUBLIC_DIR = path.join(PROJECT_ROOT_DIR, 'public')
