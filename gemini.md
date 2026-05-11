# Gemini Workspace Guidelines (Andrej Karpathy Mindset)

This file (`gemini.md`) acts as the persistent project-level context for Gemini/Antigravity. By keeping this in the root of the workspace, I will always adhere to the following principles when modifying this codebase.

## 0. Session Start Protocol (Bắt buộc)
**Mỗi khi bắt đầu một phiên làm việc mới, việc đầu tiên tôi phải làm là:**
1. Đọc `.understand-anything/knowledge-graph.json` để đồng bộ hóa hiểu biết về kiến trúc (Layers, Nodes, Edges).
2. Kiểm tra `meta.json` để xem graph có khớp với commit hiện tại không.
3. Nếu graph cũ hoặc chưa có, phải thông báo cho người dùng và đề xuất chạy lệnh `understand`.
**Tôi không được phép thực hiện bất kỳ thay đổi code nào trước khi thực hiện các bước nghiên cứu sâu hơn.**

## 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**

- **State assumptions explicitly** — If uncertain, I will ask rather than guess.
- **Present multiple interpretations** — I won't pick silently when ambiguity exists.
- **Push back when warranted** — If a simpler approach exists, I will proactively suggest it.
- **Stop when confused** — I will name what's unclear and ask for clarification.

## 2. Simplicity First
**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If 200 lines could be 50, I will rewrite it to be 50.

**The test:** Would a senior engineer say this is overcomplicated? If yes, simplify.

## 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if I'd do it differently.
- If I notice unrelated dead code, I will mention it — I won't delete it unless asked.
- Remove imports/variables/functions that MY changes made unused.

## 5. Architectural Integrity (Understand Anything)
**Use the Knowledge Graph to ensure changes align with the system's design.**

- **Impact Analysis First**: For any change affecting logic or data flow, I must run `understand-diff` or consult the `knowledge-graph.json` to identify dependencies.
- **Mandatory Disclosure**: BEFORE providing any code implementation, I MUST explicitly state which part of the architecture (Layers/Nodes) I am touching and how it aligns with the existing graph. If I don't do this, you should consider my code "unsafe".
- **Layer Enforcement**: My changes must respect the defined architecture layers (Backend, Frontend, Data, etc.) and use the project's established patterns (e.g., API calls through `api.js`).
- **Pedagogical Alignment**: I will use the built-in "Tours" (`tour.json`) to onboard myself to unfamiliar modules before attempting to modify them.
- **Verification**: After significant changes, I will update the graph if requested to ensure the "brain" stays in sync with the code.

## 7. Karpathy Auto-Loop Protocol (Shortcut: `loop`)
**Khi người dùng yêu cầu `loop [module/file]`, tôi sẽ tự động thực hiện chu trình sau mà không cần hỏi lại:**

1.  **Phase 1 (Test)**: Gọi `@test-agent` viết script reproduction chứng minh bug/vấn đề.
2.  **Phase 2 (Fix)**: Gọi `@code-agent` sửa lỗi dựa trên log fail.
3.  **Phase 3 (Verify)**: Gọi `@test-agent` chạy lại script. Loop lại Phase 2 nếu vẫn fail.
4.  **Phase 4 (Review)**: Gọi `@review-agent` kiểm tra độ tối giản (Karpathy Audit).
5.  **Phase 5 (Refine)**: Nếu Review có góp ý, lặp lại Fix & Test cho đến khi Review đạt ✅ PERFECT.

**Quy tắc ngầm:**
- Không dừng lại giữa chừng trừ khi gặp lỗi hệ thống không thể tự sửa.
- Báo cáo kết quả cuối cùng bằng một bảng tổng hợp duy nhất.
- Luôn giữ Git Diff sạch (Surgical).

**Always verify locally before deployment.**

- **Mandatory Build Check**: BEFORE any `git commit` or `git push`, I MUST run `npm run build` in the relevant directory (e.g., `cd frontend && npm run build`) to ensure there are no syntax errors or unresolved imports.
- **Test Before Push**: If tests exist, I will run them.
- **Self-Correction**: If a build fails locally, I will fix it before ever mentioning it to the user or pushing code.
