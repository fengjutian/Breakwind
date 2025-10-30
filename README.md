<div align="center">
  
![splash](./docs/assets/repo-header.png)

[**Website**](https://deta.surf) - [**Discord**](https://deta.surf/discord)

</div>

<br>

# Deta Surf：你的 AI 笔记本

Deta Breakwind 是一款 AI 笔记本，它能将你的所有文件和网页直接带入你的思考流程中。

它旨在实现同步研究和思考，最大限度地减少繁琐工作：手动搜索、打开窗口和标签页、滚动、复制和粘贴到文档编辑器中。

Breakwind 主要使用 Svelte、TypeScript 和 Rust 构建，可在 MacOS、Windows 和 Linux 上运行，以开放格式本地存储数据，并且是开源的。

![split](./docs/assets/split-note.webp)

## 项目动机

大多数应用程序专注于单一任务或单一媒体类型：笔记、网站或 PDF。真正的思考需要在不同来源的媒体之间切换，以建立联系并综合想法。我们希望帮助人们更好地思考，跨越所有媒体形式。

Breakwind 旨在成为个性化和开放的工具，服务于用户。这意味着优先考虑本地数据、开放数据格式、开源以及对 AI 模型的开放性。[了解更多](https://deta.surf/motivation)。

## 设计目标

- 原生去除广告
- 本地文件保密，支持文件锁
- 支持代码的编辑与运行，防止安全逃逸

## 安装

请查看 [GitHub 发布页](https://github.com/deta/surf/releases) 获取适用于 MacOS、Windows 和 Linux 的最新稳定版本 Surf。

您也可以从 [Deta 网站](https://deta.surf) 下载具有一些托管和附加功能（如 AI）的 Surf。该版本受不同条款约束。

有关从源代码构建和本地开发的信息，请参阅 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 快速开始 - 尝试以下功能

- _YouTube 笔记_：访问 YouTube 视频并提问
- _PDF 笔记_：打开 PDF 并提问
- _创建小程序_：使用"应用生成"工具并请求创建应用
- _网页搜索笔记_：使用"网页搜索"工具并在问题中包含"search"关键词

## 功能特性

### 多媒体库和笔记本

![notebooks](./docs/assets/readme/notebook-grid.png)

以开放透明的格式在计算机上的私有库中存储几乎任何类型的媒体。

- 支持本地文件、网站和网络链接（YouTube、推文等），或直接在 Breakwind 中创建媒体。
- 将此库组织到笔记本中。
- 离线打开和使用库中的大部分内容。
- 使用您的库为 Breakwind 的 AI 功能提供支持。

Breakwind 的库建立在名为 SFFS（Surf 扁平文件系统）的本地存储引擎上，该引擎以开放透明的格式存储数据。

[库的详细信息](/docs/LIBRARY.md)。

### 智能笔记

![smart-notes](./docs/assets/readme/smart-notes.png)

无需打开一堆窗口、点击、滚动以及复制粘贴到文档（或聊天机器人）中，就能探索和思考您的数字内容。

- 使用 `@提及` 并从任何标签页、网站或 [库](./docs/LIBRARY.md) 中的任何资源自动生成内容。
- 触发 [网络搜索](./docs/SMART_NOTES.md#web-search) 进行研究，并将结果带回您的笔记中。
- 集成 [引用](./docs/SMART_NOTES.md#citations) 功能，深度链接到原始来源，无论是网页上的某个部分、视频中的时间戳还是 PDF 中的页面。
- 使用 [Surflets](./docs/Surflets.md) 无需编写代码即可生成交互式应用程序。
- 粘贴来自其他应用程序的图像、表格或数据，Surf 能够理解并整合它们。
- 在笔记中使用丰富的格式、代码块、待办事项列表等功能。

[了解更多](/docs/SMART_NOTES.md)。

### 标签页、分屏视图和侧边栏

![split](./docs/assets/another-split.webp)

Breakwind 围绕标签页、分屏视图和侧边栏构建，便于导航。

- 在标签页中打开本地笔记、文件或网页。
- 分屏视图允许您并排查看和交互多个资源。
- 侧边栏提供对笔记本和笔记的快速访问。

### Surflets（应用生成）

![surflets](./docs/assets/readme/surflets.png)

Breakwind 可以编写交互式小程序，帮助您可视化、理解或探索需要代码辅助的概念或数据。

[了解更多](./docs/SURFLETS.md)。

### 人工智能

![models.png](./docs/assets/readme/models.png)

[Breakwind 的笔记](./docs/SMART_NOTES.md) 和 [Surflets](./docs/SURFLETS.md) 由您选择的大型语言模型提供支持。

- 为流行模型提供您自己的密钥
- 添加云端模型
- 使用本地语言模型

[了解更多](./docs/AI_MODELS.md)。

### 快捷键

在[这里](./docs/SHORTCUTS.md)找到最常用的快捷键。

## 安全

_报告安全问题，请访问_ https://github.com/deta/surf/security/policy

## 贡献

有关如何为项目做出贡献以及代码库概述的详细信息，请参阅 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 行为准则

有关我们行为准则的详细信息，请参阅 [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)。

## 许可证

本项目的源代码采用 Apache 2.0 许可证授权，但有以下例外：

1. 我们为 @ghostery/adblocker-electron 包提供的补丁采用 Mozilla Public License 2.0 (MPL-2.0) 许可证，与上游项目的许可证保持一致。
1. 部分文件可能包含特定的许可证头信息，这些信息优先于默认许可证。

除非在文件或目录中另有说明，否则所有代码默认为 Apache 2.0 许可证。

有关 Apache 2.0 许可证的更多详细信息，请参阅 [LICENSE](LICENSE)。

**注意：** Deta 名称和标志是 Deta GmbH 的商标，不受 Apache 2.0 许可证保护。

Deta GmbH 是一家商业开源公司。Surf 设计为开源软件，无需 Deta 的服务器即可运行。Deta GmbH 还提供 Breakwind 的修改版本（与 Deta 的服务器集成），受单独的条款和条件约束。您可以从 [Deta 网站](https://deta.surf/) 下载该版本的 Surf。

## 致谢

本项目使用了以下开源软件包（非完整列表）：

- [Electron](https://www.electronjs.org/)
- [Tiptap](https://tiptap.dev/)
- [Svelte](https://svelte.dev/)
- [Rust](https://www.rust-lang.org/)
