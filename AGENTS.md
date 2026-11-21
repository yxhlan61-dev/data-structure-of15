# 数据结构复习平台

每次完成用户要求的项目修改后，都必须完成验证、Git 版本上传和网站部署，不需要用户再次提醒。仅暂存本次相关文件，提交并推送到 `origin/main`；推送后检查远程提交，完成生产部署，并验证 `https://buaalearningplatform415.top/` 和 `https://www.buaalearningplatform415.top/` 均可正常访问。不得只完成本地修改或 Git 推送就结束任务。

终端无法连接 GitHub 时，可以使用已授权的 GitHub 连接同步本次改动。提交前核对远程分支，避免覆盖他人的改动。同步失败时，保留本地修改并报告具体原因。

部署前通过 Cloudflare API 核对实际承载项目的服务、域名绑定和部署状态。当前生产站点由 Cloudflare Worker `data-structure-of15` 承载；根域名和 `www.buaalearningplatform415.top` 必须绑定到同一生产站点，并检查 DNS、HTTPS 及页面资源访问结果。不能仅凭根域名可访问就认为 `www` 部署成功。

若使用 Cloudflare Pages，使用 GitHub 仓库的 `main` 分支作为生产分支，框架预设选 `None`，构建命令为 `node scripts/build-pages.mjs`，输出目录为 `dist`。启用 Git 自动部署后，由推送触发生产部署。迁移承载服务前核对现有配置，避免误改其他项目。

完成后向用户报告 Git 提交编号、远程推送结果、生产部署编号及两个域名的验证结果。核对生产部署与本次提交是否一致；仅修改文档且构建未产生变化时，应明确说明是否复用现有生产版本。若上传或部署失败、API 权限不足、DNS 或证书仍在生效中，或无法核验提交对应关系，必须报告具体状态和原因，不得声称已部署成功。
