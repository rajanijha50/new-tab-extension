export interface CategoryData {
  icon: string;              // react-icons component name or emoji fallback
  color: string;             // hex color string
  patterns: string[];        // regex patterns (serialized as strings for storage)
  isBuiltIn?: boolean;
}

export type CategoryMap = Record<string, CategoryData>;
