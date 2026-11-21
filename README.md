# 数据结构复习平台

面向数据结构期末复习的静态网站。目前覆盖第 6 章「树与二叉树」，包括基础知识库、可逐步播放的算法动画和手写代码示例。

- [生产站点](https://buaalearningplatform415.top/)
- [备用访问地址（www）](https://www.buaalearningplatform415.top/)

## 本地运行

项目使用原生 HTML、CSS 和 JavaScript，无需安装 npm 依赖。从仓库根目录启动静态服务器。

```sh
python -m http.server 8000 --bind 127.0.0.1
```

打开 [http://127.0.0.1:8000/](http://127.0.0.1:8000/)。由于 JavaScript 使用 ES 模块，请通过服务器地址预览。

要预览生产构建产物，先使用 Node.js 生成 `dist/`，再以它为站点目录启动服务器。

```sh
node scripts/build-pages.mjs
python -m http.server 8000 --bind 127.0.0.1 --directory dist
```

## 项目结构

| 路径 | 用途 |
| --- | --- |
| `index.html`、`styles/main.css` | 页面入口和全站样式 |
| `src/chapters/` | 章节知识页和 C 语言例题 |
| `src/demos/` | 算法步骤与动画预设 |
| `src/ui/` | 页面渲染、搜索和动画播放器 |
| `src/main.js`、`src/storage.js` | 页面路由和浏览器本地存储 |
| `scripts/build-pages.mjs` | 收集站点静态资源到 `dist/` |

重点代码入口为 `#code`，最大堆例题可通过 `#code/heap` 直达。学习进度和主题保存在当前浏览器及站点地址下。

## 生产发布

生产站点由 Cloudflare Worker `data-structure-of15` 承载。该 Worker 通过 Workers Builds 监听 GitHub 的 `main` 分支。推送后，在对应 GitHub 提交的 **Checks** 中查看构建结果，再核对生产版本和提交的对应关系，并检查两个站点地址的首页及静态资源。
