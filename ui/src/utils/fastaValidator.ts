import { getRawPlatformaInstance, type LocalImportFileHandle } from '@platforma-sdk/model';

export interface FastaValidationResult {
  isValid: boolean;
  error?: string;
  sequenceCount?: number;
  warnings?: string[];
}

/**
 * Validates FASTA content
 * @param content - The file content as string
 * @returns FastaValidationResult with validation details
 */
export function validateFastaContent(content: string): FastaValidationResult {
  const warnings: string[] = [];
  
  // Check if content is empty
  if (!content.trim()) {
    return {
      isValid: false,
      error: 'File is empty'
    };
  }

  const lines = content.split(/\r?\n/);
  let sequenceCount = 0;
  let currentSequence = '';
  let hasHeader = false;
  let lineNumber = 0;

  for (const line of lines) {
    lineNumber++;
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) continue;

    if (trimmedLine.startsWith('>')) {
      // Header line
      if (currentSequence && !hasHeader) {
        return {
          isValid: false,
          error: `Line ${lineNumber}: Found sequence data before any header`
        };
      }
      
      if (currentSequence) {
        sequenceCount++;
        currentSequence = '';
      }
      
      hasHeader = true;
      
      // Check if header has content after '>'
      if (trimmedLine.length === 1) {
        return {
          isValid: false,
          error: `Line ${lineNumber}: Header is empty (only contains '>')`
        };
      }

      // Header content validation (just check it's not empty)
      const headerContent = trimmedLine.substring(1); // Remove '>' prefix

    } else {
      // Sequence line
      if (!hasHeader) {
        return {
          isValid: false,
          error: `Line ${lineNumber}: Found sequence data before any header`
        };
      }
      
      // Validate sequence characters (allow standard nucleotide and amino acid codes)
      const validChars = /^[ACGTUWSMKRYBDHVNacgtuwsmkrybdhvn-]+$/;
      if (!validChars.test(trimmedLine)) {
        const invalidChars = trimmedLine.match(/[^ACGTUWSMKRYBDHVNacgtuwsmkrybdhvn-]/g);
        return {
          isValid: false,
          error: `Line ${lineNumber}: Invalid characters in sequence: ${invalidChars?.join(', ')}`
        };
      }
      
      currentSequence += trimmedLine;
    }
  }

  // Count the last sequence if exists
  if (currentSequence && hasHeader) {
    sequenceCount++;
  }

  // Check if we have at least one complete sequence
  if (!hasHeader) {
    return {
      isValid: false,
      error: 'No FASTA headers found (lines starting with ">")'
    };
  }

  if (sequenceCount === 0) {
    return {
      isValid: false,
      error: 'No sequences found after headers'
    };
  }

  // Check for minimum sequence count
  if (sequenceCount < 1) {
    return {
      isValid: false,
      error: 'At least one sequence is required'
    };
  }

  return {
    isValid: true,
    sequenceCount,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

/**
 * Validates a FASTA file using Platforma SDK file reading
 * @param file - The LocalImportFileHandle to validate
 * @returns Promise<FastaValidationResult>
 */
export async function validateFastaFile(file: LocalImportFileHandle): Promise<FastaValidationResult> {
  try {
    // Read file content using Platforma SDK (following immune-assay-data pattern)
    const data = await getRawPlatformaInstance().lsDriver.getLocalFileContent(file);
    
    // Convert ArrayBuffer to string
    const content = new TextDecoder('utf-8').decode(data);
    
    return validateFastaContent(content);
  } catch (error) {
    return {
      isValid: false,
      error: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Quick check if a string looks like FASTA format
 * @param content - File content or preview
 * @returns boolean
 */
export function looksLikeFasta(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) return false;
  
  // Check if it starts with '>' and has sequence data
  const firstLine = trimmed.split('\n')[0];
  return firstLine.startsWith('>') && /[ACGTUacgtu]/.test(trimmed);
}

/**
 * Extracts header information from FASTA content
 * @param content - FASTA file content
 * @returns Array of parsed header objects
 */
export function extractFastaHeaders(content: string): Array<{ line: number; header: string; fields: string[] }> {
  const lines = content.split(/\r?\n/);
  const headers: Array<{ line: number; header: string; fields: string[] }> = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('>')) {
      const headerContent = line.substring(1);
      headers.push({
        line: i + 1,
        header: headerContent,
        fields: [headerContent] // Store the entire header as a single field
      });
    }
  }
  
  return headers;
} 