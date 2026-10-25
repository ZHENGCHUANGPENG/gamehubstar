// Gameplay orientation is metadata, never inferred from promotional artwork.
import {playerOrientation} from './community-player-session-8515da2b37.js';
export function orientationOf(game){return playerOrientation(game);}
export function resolveOrientation(game){return Promise.resolve(orientationOf(game));}
