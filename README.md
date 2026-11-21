# 数据结构复习平台

原生 HTML/CSS/JavaScript 静态复习网站，覆盖全九章基础知识库、交互算法可视化和 C 语言重点代码。无需后端、付费 API 或 AI 聊天。学习进度、主题与自测错题记录保存在当前站点的 localStorage。

- [生产站点](https://buaalearningplatform415.top/)
- [www 站点](https://www.buaalearningplatform415.top/)

## 内容覆盖

| 章节 | 知识主题 | 交互实验页 | 可独立编译的代码单元 |
| --- | ---: | ---: | ---: |
| 01 绪论 | 2 | 0 | 1 |
| 02 线性表 | 4 | 1 | 4 |
| 03 栈和队列 | 4 | 3 | 4 |
| 04 串 | 3 | 1 | 1 |
| 05 数组与广义表 | 4 | 0 | 0 |
| 06 树与二叉树 | 6 | 5 | 2 |
| 07 图 | 7 | 5 | 3 |
| 08 查找 | 6 | 4 | 4 |
| 09 排序 | 9 | 2 | 4 |
| 合计 | 45 | 21 | 23 |

多个算法共用一个实验页：例如 BF/KMP、DFS/BFS、Prim/Kruskal、线性探测与拉链插入、八种比较排序、三种分配排序。所有实验支持自定义输入、预设、播放暂停、单步回退、重置和变速，默认 0.5×，提供 4× 选项。代码单元可包含多个函数，附前置条件、实现讲解、复杂度、手推示例和可展开完整程序。

内容依据仓库中的《数据结构知识总结》、课程 PDF、《数据结构复习范围》和 2022 A 卷。原课件和试卷只供本地核对，不打包进网站。第 5 章仅保留知识库；AVL 提供插删旋转动画，不列入手写代码；AOE 网与关键路径按最新修改意见补充为扩展复习；线索树、B 树、多源最短路按原范围排除。更多说明见 [实现与验收记录](IMPLEMENTATION_REPORT.md)。

## 本地运行与检查

需要 Node.js、Python；运行代码检查还需要 GCC（或设置 CC 为兼容编译器路径）。站点运行本身没有 npm 依赖。

```sh
python -m http.server 8000 --bind 127.0.0.1
npm test
npm run build
```

打开 [本地预览](http://127.0.0.1:8000/)。也可启动静态服务器以 `dist` 为目录检查构建产物。ES 模块应通过 HTTP 访问。

`npm test` 检查章节关联、默认和边界预设、随机排序与 KMP 对照、AVL 平衡不变量，以及全部 23 个 C 程序的编译和示例运行。浏览器检查另用 `node scripts/browser-check.mjs`：需已有 Playwright 和 Edge，可通过 `PLAYWRIGHT_MODULE` 指向包目录、`BROWSER_CHANNEL` 改为 chrome、`TEST_URL` 指向预览站点，`SCREENSHOT_DIR` 可保存截图。浏览器检查使用独立临时会话，不修改日常浏览器记录。

## 页面与文件

- `#chapter/02`：章节总览；`#chapter/02/lab`、`#chapter/02/code`：该章另两个模块。
- `#ch02-doubly`：稳定知识点链接；`#lab/matching`：算法实验。
- `#code/08/array-bst`：指定代码单元；`#mistakes`：本地自测错题记录。
- 原有树章节链接继续兼容，包括 `#ch06-traversal`、`#lab/traversal`、`#code/heap`。`#knowledge`、`#lab`、`#code` 进入当前章节的模块。
- `src/chapters/course.js`：全课程内容和关联；`exam-code.js`：新增代码例题；原有树内容独立保留。
- `src/demos/`：纯函数生成不可变步骤快照；`src/ui/`：导航、搜索、树/图绘制和共用播放器。
- `src/storage.js`：沿用 `ds-review:` 本地存储前缀。跨章切换不丢弃其他章节进度；错题由自测后手动收集、移除，不做自动判题。

## 生产发布

生产由 Cloudflare Worker `data-structure-of15` 承载，两域名绑定同一 production 环境。Workers Builds 监听 GitHub main。仓库提供构建命令 `node scripts/build-pages.mjs`，静态输出目录 `dist`；当前远程自动流程可直接上线源资源，但没有生成版本清单，因此本次另从相同提交的干净工作区构建并发布 `dist`。后续发布也应核对清单，必要时补发构建产物。保持既有承载服务，不迁移到 Pages。

构建生成 `dist/revision.json`，包含构建时 Git 提交及所有静态文件 SHA-256。发布后须核对 GitHub 对应提交的 Workers Builds 检查、Cloudflare 最新部署/版本、两域名的 HTTPS 和 revision，以及各资源哈希。可运行 `python scripts/verify-production.py` 检查当前提交对应的两个生产域名与全资源哈希；首页只剔除 Cloudflare 已有的固定来源 Web Analytics 自动信标，其余内容逐字节核验。先提交再重新构建；未提交工作区构建的 revision 仅代表 HEAD，不能据此证明未提交文件已发布。
