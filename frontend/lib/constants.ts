export const LANGUAGES = [
  { value: "", label: "Auto-detect" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "ruby", label: "Ruby" },
  { value: "php", label: "PHP" },
  { value: "sql", label: "SQL" },
] as const;

export const SAMPLE_CODE = `def get_user(id):
    query = "SELECT * FROM users WHERE id = " + id
    return db.execute(query)

def process(items):
    result = []
    for i in range(len(items)):
        for j in range(len(items)):
            if items[i] == items[j]:
                result.append(items[i])
    return result

password = "admin123"
api_key = "sk-1234567890"

def divide(x, y):
    return x / y
`;

export const TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "issues", label: "Issues", icon: "🐛" },
  { id: "refactored", label: "Improved", icon: "✨" },
  { id: "chat", label: "Chat", icon: "💬" },
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  bug: "🐛",
  bugs: "🐛",
  security: "🔒",
  performance: "⚡",
  style: "🎨",
};
