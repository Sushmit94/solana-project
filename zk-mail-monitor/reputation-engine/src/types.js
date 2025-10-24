// reputation-engine/src/types.ts
// Centralized type definitions for the reputation engine
import { EventType } from '../../analyzer/src/detector.js';
/**
 * Trust level categories based on sender reputation.
 */
export var TrustLevel;
(function (TrustLevel) {
    TrustLevel["Unknown"] = "Unknown";
    TrustLevel["Suspicious"] = "Suspicious";
    TrustLevel["Low"] = "Low";
    TrustLevel["Medium"] = "Medium";
    TrustLevel["High"] = "High";
    TrustLevel["Trusted"] = "Trusted";
})(TrustLevel || (TrustLevel = {}));
//# sourceMappingURL=types.js.map