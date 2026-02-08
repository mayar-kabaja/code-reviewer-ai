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

export const SAMPLE_CODES: { code: string; language: string }[] = [
  {
    language: "python",
    code: `def get_user(id):
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
    return x / y`,
  },
  {
    language: "javascript",
    code: `function fetchUser(id) {
  const url = "https://api.example.com/user/" + id;
  return fetch(url).then(r => r.json());
}

async function getUsers() {
  const ids = [1, 2, 3];
  const users = [];
  for (var i = 0; i < ids.length; i++) {
    users.push(await fetchUser(ids[i]));
  }
  return users;
}

if (userInput == null) {
  doSomething();
}`,
  },
  {
    language: "python",
    code: `import os

def read_config():
    path = os.environ.get("CONFIG_PATH") or "/etc/app/config"
    with open(path) as f:
        return eval(f.read())

def run_query(user_input):
    sql = "SELECT * FROM users WHERE name = '" + user_input + "'"
    return db.execute(sql)`,
  },
  {
    language: "java",
    code: `public class UserService {
    public String getUserName(int id) {
        if (id == null) return "";
        return db.query("SELECT name FROM users WHERE id = " + id);
    }
    public void process(List items) {
        for (int i = 0; i < items.size(); i++)
            for (int j = 0; j < items.size(); j++)
                if (items.get(i).equals(items.get(j)))
                    results.add(items.get(i));
    }
}`,
  },
  {
    language: "go",
    code: `func HandleRequest(w http.ResponseWriter, r *http.Request) {
    id := r.URL.Query().Get("id")
    query := "SELECT * FROM users WHERE id = " + id
    row := db.QueryRow(query)
    // ...
}

var ApiKey = "sk-live-abc123"`,
  },
  {
    language: "python",
    code: `def parse_date(s):
    return datetime.strptime(s, "%Y-%m-%d")

def get_orders(customer_id):
    cursor.execute("SELECT * FROM orders WHERE customer_id = %s" % customer_id)
    return cursor.fetchall()`,
  },
  {
    language: "javascript",
    code: `const config = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxx",
  secret: process.env.SECRET || "default_secret"
};

function find(items, id) {
  for (let i = 0; i <= items.length; i++) {
    if (items[i].id === id) return items[i];
  }
}`,
  },
];

/** @deprecated Use SAMPLE_CODES and pick one at random */
export const SAMPLE_CODE = SAMPLE_CODES[0].code;

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
