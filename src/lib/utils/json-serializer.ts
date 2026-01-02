/**
 * JSON Serializer for Exercise Import
 * Serializes LaTeX content in JSON strings to JSON-safe format
 * 
 * Purpose: Convert AI output JSON (with raw LaTeX) to valid JSON format
 * Scope: Serialize ALL string values in the entire JSON structure (recursive)
 * 
 * Principle: System-controlled serialization, NOT business logic modification
 */

/**
 * Valid JSON escape sequences
 * According to JSON spec: \", \\, \/, \b, \f, \n, \r, \t, \uXXXX
 */
const VALID_JSON_ESCAPE_PATTERN = /^\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4})/;

/**
 * Serialize a string value to JSON-safe format
 * Escapes invalid escape sequences (like \%, \{, \}, etc.) by escaping the backslash
 * 
 * @param value - String value that may contain invalid JSON escapes
 * @returns Serialized string with all invalid escapes properly escaped
 */
function serializeStringValue(value: string): string {
  if (!value || typeof value !== 'string') {
    return value;
  }
  
  let result = '';
  let i = 0;
  
  while (i < value.length) {
    if (value[i] === '\\' && i + 1 < value.length) {
      // Check if this is a valid JSON escape sequence
      const remaining = value.substring(i);
      const isValidEscape = VALID_JSON_ESCAPE_PATTERN.test(remaining);
      
      if (isValidEscape) {
        // Valid escape sequence, copy it as is
        if (remaining[1] === 'u') {
          // \uXXXX - 6 characters
          result += value.substring(i, i + 6);
          i += 6;
        } else {
          // Other valid escapes - 2 characters
          result += value.substring(i, i + 2);
          i += 2;
        }
      } else {
        // Invalid escape sequence (like \%, \{, \}, \f, etc.)
        // Escape the backslash: \ → \\
        result += '\\\\';
        i++;
        // Don't skip next char, it will be processed in next iteration
      }
    } else {
      result += value[i];
      i++;
    }
  }
  
  return result;
}

/**
 * Recursively serialize all string values in a JSON object/array
 * 
 * @param obj - Any JSON value (object, array, string, number, boolean, null)
 * @returns Serialized version with all string values properly escaped
 */
function serializeJsonRecursive(obj: unknown): unknown {
  // Handle null and undefined
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // Handle primitives
  if (typeof obj === 'string') {
    return serializeStringValue(obj);
  }
  
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => serializeJsonRecursive(item));
  }
  
  // Handle objects
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeJsonRecursive(value);
    }
    return result;
  }
  
  // Fallback: return as is
  return obj;
}

/**
 * Serialize exercise JSON by escaping invalid LaTeX escape sequences
 * 
 * This function:
 * 1. Tries to parse the JSON string
 * 2. If parse succeeds, recursively serializes all string values
 * 3. If parse fails, attempts to fix invalid escapes at string level, then retries
 * 
 * @param jsonString - Raw JSON string from AI (may contain invalid escapes like \%, \{, etc.)
 * @returns Serialized JSON string (JSON-safe)
 */
export function serializeExerciseJson(jsonString: string): string {
  if (!jsonString || !jsonString.trim()) {
    return jsonString;
  }

  // First, try to parse JSON
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    // JSON is invalid, likely due to invalid escape sequences
    // Try to fix at string level first
    const fixed = fixInvalidEscapesInJsonString(jsonString);
    
    try {
      parsed = JSON.parse(fixed);
    } catch (e2) {
      // Still invalid, return original (validator will handle error)
      return jsonString;
    }
  }
  
  // Recursively serialize all string values
  const serialized = serializeJsonRecursive(parsed);
  
  // Stringify back to JSON
  return JSON.stringify(serialized);
}

/**
 * Fix invalid escape sequences in JSON string at the string level
 * This is a fallback when JSON cannot be parsed
 * 
 * Strategy: Find all backslashes followed by invalid escape characters
 * and escape the backslash itself
 */
function fixInvalidEscapesInJsonString(jsonString: string): string {
  let result = '';
  let i = 0;
  let inString = false;
  let escapeNext = false;
  
  while (i < jsonString.length) {
    const char = jsonString[i];
    
    if (escapeNext) {
      // We're processing an escape sequence
      const validEscapes = ['"', '\\', '/', 'b', 'f', 'n', 'r', 't'];
      const isUnicodeEscape = char === 'u' && i + 4 < jsonString.length && 
        /^[0-9a-fA-F]{4}$/.test(jsonString.substring(i + 1, i + 5));
      
      if (validEscapes.includes(char) || isUnicodeEscape) {
        // Valid escape, keep it
        if (isUnicodeEscape) {
          result += '\\' + jsonString.substring(i, i + 5);
          i += 5;
        } else {
          result += '\\' + char;
          i++;
        }
      } else {
        // Invalid escape, escape the backslash
        result += '\\\\' + char;
        i++;
      }
      escapeNext = false;
    } else if (char === '\\' && inString) {
      // Start of escape sequence in string
      escapeNext = true;
      i++;
    } else {
      if (char === '"' && (i === 0 || jsonString[i - 1] !== '\\')) {
        // Toggle string state (handle escaped quotes)
        inString = !inString;
      }
      result += char;
      i++;
    }
  }
  
  return result;
}

