---
title: 如何使用 Chrome DevTools – 提升 Web 开发的简单策略
---

# 如何使用 Chrome DevTools – 提升 Web 开发的简单策略

Chrome 开发者工具（DevTools）是一组在 Google Chrome 浏览器内直接诊断和解决 Web 开发问题的工具。它提供了对网站内部运行方式的直接访问 - 可以检查 HTML 和 CSS，调试 JavaScript，分析性能，并实时查看代码的立即影响。

这种直接访问网站内部运行方式对于快速高效地诊断问题非常重要，确保您的 Web 应用程序既具有良好的性能又没有错误。

[[toc]]

## 什么是 Chrome DevTools？

Chrome DevTools 是一组工具，对于在 Google Chrome 浏览器内进行 Web 开发的人来说是不可或缺的。它提供直接访问网页内部结构的功能 - 可以检查 HTML 和 CSS，调试 JavaScript，分析性能，并实时查看代码的立即影响。

## 如何打开 Chrome DevTools

要在 Chrome 浏览器中打开 DevTools，您可以通过以下方式之一：

- 在任何网页上右键单击并从选项列表中选择“检查”。
- 使用快捷键（在 Mac 上是 Command + Option + I，Windows 上是 Control + Shift + I）。
- 单击 Chrome 浏览器中您的个人资料图片旁边的三个点图标，选择“更多工具”和“开发者工具”（在第二个选项框中选择）。

通常，它会以分屏界面打开，要么在当前网页下方，要么在其旁边。一旦打开，其功能将排列在 DevTools 窗口顶部的选项卡中。这些选项卡包括：Elements（元素）、Console（控制台）、Source（源代码）、Network（网络）、Application（应用程序）、Security（安全）、Memory（内存）、Performance（性能）、Audits（审核）。

## 便于导航的键盘快捷键

- 使用 Cmd 或 Ctrl + Shift + C 打开 Elements 面板
- 使用 Cmd 或 Ctrl + Shift + J 打开 Console 面板
- 使用 Cmd 或 Ctrl + ]向前移动到下一个面板
- 使用 Cmd 或 Ctrl + [向后移动到上一个面板

## Chrome DevTools 的主要功能

DevTools 充满了对 Web 开发人员至关重要的功能，可以简化其工作流程的各个方面。让我们现在详细看看其中的一些。

### Elements 面板

该面板用于实时检查和修改网页的 HTML 和 CSS，非常适用于调试布局问题或在实际代码中应用新样式之前进行实验。您还可以查看 DOM（文档对象模型）的结构。

### Console 面板

该面板作为您在浏览器内部 JavaScript 的互动游乐场。无论是使用快速的 console.log()跟踪难以捉摸的错误还是在 Console 面板中测试 JavaScript 片段和查看当前加载的网页中的任何日志或错误，都可以进行实验。

### Network 面板

该面板为您提供网页上所有网络活动的概览 - 从跟踪加载的每个资源到网站如何与服务器通信。

### Performance 面板

该面板用于捕获和分析网站的性能指标。它显示与页面交互时发生的所有活动。

以上只是可用的众多面板中的一小部分，但它们是最受欢迎和必须了解的。正确使用它们将使您的开发过程更直观和令人满足。

## Chrome DevTools 的实际用例

在以下互动示例中，我故意在 Codepen 中创建了一个小项目，并引入了一些问题，以模拟使用 Chrome DevTools 进行实际调试的场景。

### 调试 HTML 和 CSS

我们的小项目包含一个模态框，点击后应显示一个带有一些重要信息的模态窗口。但是有一个 bug 阻止了这个过程。这为实际演示如何使用 Elements 面板来排除样式和结构问题创造了一个场景。

#### 步骤 1 - 初始检查

尝试通过点击“Click me to learn a secret”按钮触发模态框。由于我们设置了它不能工作，右键单击模态框应该出现的区域，选择“检查”以打开 DevTools 的 Elements 面板。

#### 步骤 2 - 诊断可见性问题

在 Elements 面板中，定位 DOM 中的模态框，查看模态框存在但不可见。这证实了 bug 是由我们的 CSS 代码 display: hidden 引起的。

当您在 DOM 中点击模态框时，任何相应的 CSS 类都将在 Elements 面板底部的 Styles 中显示。您可以切换一些属性，即时查看效果。

手动将类名从 modal hidden 更改为 modal block，以触发显示模态框的正确属性。

#### 步骤 3 - 居中模态框

现在模态框可见了，但它显示在顶部 - 与我们希望它位于页面中央的位置不同。

要更改此内容，通过添加第二个-50%修改 transform 属性为 translate(-50%，-50%)，并确保 top: 50%和 left: 50%正确设置以使模态框居中。

#### 步骤 4 - 提高外观

您可以进一步优化模态框的外观，通过直接在 Styles 中调整其 background-color，padding 或其他样

式属性，以实现期望的外观和感觉。

### 使用 Sources 面板调试 JavaScript

我在我们的模态小项目的 JavaScript 代码中引入了一个 bug，阻止了点击按钮时打开模态框。

在下面的代码中，openModal 函数被设置为删除指定类。然而，这不起作用，因为我们故意拼写错误。

#### 步骤 1 - 设置断点

打开 Chrome DevTools 并导航到 Sources 面板。在这里，找到包含模态功能的 JavaScript 文件（在我们的示例中是 pen.js）。

openModal 函数包含在屏幕上显示模态的逻辑。此函数将包含一行，其中对模态元素的类进行操作以删除“hidden”类。

点击 DevTools 中此代码行旁边的数字。一个蓝色（或有时是红色，取决于主题）图标将显示在行号旁边，表示已设置断点。一旦代码达到此行，断点将暂停 JavaScript 代码的执行。

#### 步骤 2 - 检查代码执行流程

在我们的断点位置，尝试通过单击按钮打开模态框。我们的 JavaScript 代码的执行现在在断点处暂停，这使我们可以逐行查看代码。

这是一个观察变量，函数调用，查找异常的机会，例如函数拼写错误，不正确的逻辑，或者解释模态框为什么不起作用的未捕获异常。

在我们的情况下，因为我们故意拼写类名 hidden 为 hiddn，所以模态框不起作用。在代码中修复它以使模态框再次正常工作。

### 使用 Network 面板优化性能

在这里，我添加了一个 fetch 函数，它对实时端点（https://jsonplaceholder.typicode.com/posts/1）进行API调用。这是探索Network面板在诊断和理解与网络相关的问题方面的能力的绝佳机会。

从下面的代码中，您可以看到 openModal 函数不仅打开模态框，还对 jsonplaceholder 端点进行 API 调用以获取一些数据。

#### 步骤 1 - 启动 API 调用

在模态项目 UI 上点击“Click me to learn a secret”按钮。尽管模态框不可见，因为 openModal 函数内包含有关 fetch 逻辑，但将进行 API 调用。

#### 步骤 2 - 检查 Network 面板

理想情况下，您在单击按钮之前应该打开 Network 面板，但您也可以反转步骤。有关 API 请求的详细信息，例如请求的方法，状态码，响应以及完成所需的时间，将在 headers，preview，response，initiator 和 timing 标签下提供。

#### 步骤 3 - 模拟网络条件

使用 Network 面板的限制功能来模拟各种网络速度，如离线或慢 3G，以查看 API 请求在受限条件下的行为。

通过比较不同网络速度对应用性能的影响，了解优化数据加载策略对提高用户体验的重要性，特别是在较慢的连接上。

## 结论

将 Chrome DevTools 纳入您的 Web 开发例程中不仅是修复错误。它是关于简化工作流程，使您的站点更具可访问性并提高其性能。

通过我们的模态窗口小项目，我们亲身体验了 DevTools 如何应对各种开发挑战，但这只是它所能做的冰山一角。

随着您继续探索其功能并熟悉其特性，您会发现它是您 Web 开发旅程中的无价伴侣 - 设计旨在使您的开发过程不仅更快，而且更具有回报。

:::tip
[原文转载](https://www.freecodecamp.org/news/chrome-devtools/)
:::
