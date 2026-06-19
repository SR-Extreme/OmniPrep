// Java Library for parsing Java input and output
import java.util.*;

@SuppressWarnings("unchecked")
class MiniJson {
    private final String s;
    private int i;

    private MiniJson(String s) {
        this.s = s;
        this.i = 0;
    }

    static Object parse(String raw) {
        return new MiniJson(raw.trim()).parseValue();
    }

    private void skipWs() {
        while (i < s.length() && Character.isWhitespace(s.charAt(i))) i++;
    }

    private Object parseValue() {
        skipWs();
        if (i >= s.length()) return null;
        char c = s.charAt(i);
        if (c == '{') return parseObject();
        if (c == '[') return parseArray();
        if (c == '"') return parseString();
        if (c == 't' || c == 'f') return parseBoolean();
        if (c == 'n') return parseNull();
        return parseNumber();
    }

    private Map<String, Object> parseObject() {
        Map<String, Object> obj = new LinkedHashMap<String, Object>();
        i++;
        skipWs();
        if (i < s.length() && s.charAt(i) == '}') {
            i++;
            return obj;
        }
        while (true) {
            skipWs();
            String key = parseString();
            skipWs();
            i++;
            obj.put(key, parseValue());
            skipWs();
            if (i >= s.length()) break;
            char ch = s.charAt(i);
            if (ch == '}') {
                i++;
                break;
            }
            i++;
        }
        return obj;
    }

    private List<Object> parseArray() {
        List<Object> arr = new ArrayList<Object>();
        i++;
        skipWs();
        if (i < s.length() && s.charAt(i) == ']') {
            i++;
            return arr;
        }
        while (true) {
            arr.add(parseValue());
            skipWs();
            if (i >= s.length()) break;
            char ch = s.charAt(i);
            if (ch == ']') {
                i++;
                break;
            }
            i++;
        }
        return arr;
    }

    private String parseString() {
        i++;
        StringBuilder sb = new StringBuilder();
        while (i < s.length()) {
            char c = s.charAt(i++);
            if (c == '"') break;
            if (c == '\\' && i < s.length()) {
                char esc = s.charAt(i++);
                if (esc == '"') sb.append('"');
                else if (esc == '\\') sb.append('\\');
                else if (esc == '/') sb.append('/');
                else if (esc == 'b') sb.append('\b');
                else if (esc == 'f') sb.append('\f');
                else if (esc == 'n') sb.append('\n');
                else if (esc == 'r') sb.append('\r');
                else if (esc == 't') sb.append('\t');
                else if (esc == 'u') {
                    int code = Integer.parseInt(s.substring(i, i + 4), 16);
                    sb.append((char) code);
                    i += 4;
                } else {
                    sb.append(esc);
                }
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }

    private Boolean parseBoolean() {
        if (s.startsWith("true", i)) {
            i += 4;
            return Boolean.TRUE;
        }
        i += 5;
        return Boolean.FALSE;
    }

    private Object parseNull() {
        i += 4;
        return null;
    }

    private Number parseNumber() {
        int start = i;
        if (s.charAt(i) == '-') i++;
        while (i < s.length()) {
            char ch = s.charAt(i);
            if (Character.isDigit(ch) || ch == '.' || ch == 'e' || ch == 'E' || ch == '+' || ch == '-') {
                i++;
            } else {
                break;
            }
        }
        String num = s.substring(start, i);
        if (num.contains(".") || num.contains("e") || num.contains("E")) {
            return Double.parseDouble(num);
        }
        long v = Long.parseLong(num);
        if (v >= Integer.MIN_VALUE && v <= Integer.MAX_VALUE) return Integer.valueOf((int) v);
        return Long.valueOf(v);
    }

    static int getInt(Object data, String key) {
        Object v = ((Map<String, Object>) data).get(key);
        if (v == null) return 0;
        if (v instanceof Number) return ((Number) v).intValue();
        return Integer.parseInt(v.toString());
    }

    static boolean getBoolean(Object data, String key) {
        Object v = ((Map<String, Object>) data).get(key);
        if (v == null) return false;
        if (v instanceof Boolean) return ((Boolean) v).booleanValue();
        return Boolean.parseBoolean(v.toString());
    }

    static String getString(Object data, String key) {
        Object v = ((Map<String, Object>) data).get(key);
        return v == null ? "" : v.toString();
    }

    static int[] getIntArray(Object data, String key) {
        Object v = ((Map<String, Object>) data).get(key);
        if (!(v instanceof List)) return new int[0];
        List<?> list = (List<?>) v;
        int[] out = new int[list.size()];
        for (int j = 0; j < list.size(); j++) {
            Object item = list.get(j);
            out[j] = item instanceof Number
                    ? ((Number) item).intValue()
                    : Integer.parseInt(item.toString());
        }
        return out;
    }

    static int[][] getIntMatrix(Object data, String key) {
        Object v = ((Map<String, Object>) data).get(key);
        if (!(v instanceof List)) return new int[0][0];
        List<?> rows = (List<?>) v;
        int[][] out = new int[rows.size()][];
        for (int r = 0; r < rows.size(); r++) {
            List<?> row = (List<?>) rows.get(r);
            out[r] = new int[row.size()];
            for (int c = 0; c < row.size(); c++) {
                Object item = row.get(c);
                out[r][c] = item instanceof Number
                        ? ((Number) item).intValue()
                        : Integer.parseInt(item.toString());
            }
        }
        return out;
    }

    static String[] getStringArray(Object data, String key) {
        Object v = ((Map<String, Object>) data).get(key);
        if (!(v instanceof List)) return new String[0];
        List<?> list = (List<?>) v;
        String[] out = new String[list.size()];
        for (int j = 0; j < list.size(); j++) out[j] = list.get(j).toString();
        return out;
    }

    static String[][] getStringMatrix(Object data, String key) {
        Object v = ((Map<String, Object>) data).get(key);
        if (!(v instanceof List)) return new String[0][0];
        List<?> rows = (List<?>) v;
        String[][] out = new String[rows.size()][];
        for (int r = 0; r < rows.size(); r++) {
            List<?> row = (List<?>) rows.get(r);
            out[r] = new String[row.size()];
            for (int c = 0; c < row.size(); c++) out[r][c] = row.get(c).toString();
        }
        return out;
    }

    static String toJson(Object value) {
        if (value == null) return "null";
        if (value instanceof Boolean) return ((Boolean) value).booleanValue() ? "true" : "false";
        if (value instanceof Number) {
            double d = ((Number) value).doubleValue();
            if (d == Math.rint(d) && !Double.isInfinite(d)) {
                return String.valueOf(((Number) value).longValue());
            }
            return value.toString();
        }
        if (value instanceof String) return "\"" + escape((String) value) + "\"";
        if (value instanceof int[]) {
            int[] arr = (int[]) value;
            StringBuilder sb = new StringBuilder("[");
            for (int j = 0; j < arr.length; j++) {
                if (j > 0) sb.append(',');
                sb.append(arr[j]);
            }
            return sb.append(']').toString();
        }
        if (value instanceof int[][]) {
            int[][] matrix = (int[][]) value;
            StringBuilder sb = new StringBuilder("[");
            for (int r = 0; r < matrix.length; r++) {
                if (r > 0) sb.append(',');
                sb.append('[');
                for (int c = 0; c < matrix[r].length; c++) {
                    if (c > 0) sb.append(',');
                    sb.append(matrix[r][c]);
                }
                sb.append(']');
            }
            return sb.append(']').toString();
        }
        if (value instanceof List) {
            List<?> list = (List<?>) value;
            StringBuilder sb = new StringBuilder("[");
            for (int j = 0; j < list.size(); j++) {
                if (j > 0) sb.append(',');
                sb.append(toJson(list.get(j)));
            }
            return sb.append(']').toString();
        }
        if (value instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) value;
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<?, ?> e : map.entrySet()) {
                if (!first) sb.append(',');
                first = false;
                sb.append('"').append(escape(String.valueOf(e.getKey()))).append("\":");
                sb.append(toJson(e.getValue()));
            }
            return sb.append('}').toString();
        }
        return toJson(value.toString());
    }

    private static String escape(String str) {
        return str.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
