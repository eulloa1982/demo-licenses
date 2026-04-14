export interface OcrWord {
  WordText: string;
  Left: number;
  Top: number;
  Height: number;
  Width: number;
}

export interface OcrLine {
  LineText: string;
  Words: OcrWord[] | null;
  MaxHeight: number;
  MinTop: number;
}

export interface OcrParsedResult {
  TextOverlay: {
    Lines: OcrLine[];
    HasOverlay: boolean;
    Message: string;
  };
  TextOrientation: string;
  FileParseExitCode: number;
  ParsedText: string;
  ErrorMessage: string;
  ErrorDetails: string;
}

export interface OcrSpaceResponse {
  ParsedResults: OcrParsedResult[];
  OCRExitCode: number;
  IsErroredOnProcessing: boolean;
  ProcessingTimeInMilliseconds: string;
  SearchablePDFURL?: string;
}
