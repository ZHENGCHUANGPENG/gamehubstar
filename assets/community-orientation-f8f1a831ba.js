// Gameplay orientation is metadata, never inferred from promotional artwork.
import {playerOrientation} from './community-player-session-f892e0c701.js';
export function orientationOf(game){return playerOrientation(game);}
export function resolveOrientation(game){return Promise.resolve(orientationOf(game));}
