# Debug Session: annotation-style-missing

**Status**: [OPEN]  
**Created**: 2026-06-10  
**Issue**: 点击高亮/下划线/删除线等工具后，选中文本处没有显示标注样式

---

## Hypotheses
| ID | Description | Status | Evidence |
|----|-------------|--------|----------|
| H1 | highlightAnnotation 未被调用 | Pending | - |
| H2 | annotations.mark API 使用方式错误 | Pending | - |
| H3 | CSS style 通过 mark options 无法生效，需用 class 注入 | Pending | - |
| H4 | cfiStart/cfiEnd 无效导致 mark 静默失败 | Pending | - |
| H5 | mark 成功应用，但随后被意外清除 | Pending | - |

---

## Logs
(Will be populated by Debug Server)

---

## Fix Summary
(TBD)
