# 限时客观题模拟考试系统开发日志

## 2023 年 4 月 14 日

使用 `node v18.16.0 LTS`

`npm` 全局安装 `typescript`

`npm init` 初始化

`tsc --init` 生成初始化配置文件，修改 `rootDir = src` 和 `outDir = dist`，使用 `ES2022`

`npm` 安装 `express` 和 `@type/express`

编写 `start` 脚本

执行 `tsc` 可编译 `ts` 为 `js`

`package.json` 设置 `type` 为 `module`

编写 `.gitignore` 文件

## 2023 年 4 月 17 日

为 `node` 添加 `--experimental-specifier-resolution=node` 选项

> <https://blog.csdn.net/jadexupeng/article/details/126928989>

## 2023 年 4 月 18 日

`npm` 安装 `mongodb`

更新数据库 ER 图

实现接口：`getAllPapers` 获取所有试卷，`getAllQuestionsByPaper` 获取某试卷所有试题，可设置是否返回答案。

## 2023 年 4 月 19 日

更新用例图

设计接口 `testPaper` 限时测试某试卷，`markAnswer` 标记某题答案，`submit` 提交试卷，`getTest` 获取当前测试信息。

用例 4：用户中途退出测试后需要重新获取测试信息以继续测试。

`npm` 更新 `express` 为 `5.0.0-beta.1` 版本，支持自动捕获异步错误。

> <http://expressjs.com/en/guide/error-handling.html>

## 2023 年 4 月 20 日

更新数据库 ER 图

`npm` 安装 `undici`

实现接口 `testPaper`，`markAnswer`

## 2023 年 4 月 21 日

实现每秒记录堆内存占用。

使用 `express 5` 全局捕获异步错误时，异步函数执行异步调用必须使用 `await`。

## 2023 年 4 月 22 日

实现接口 `submit`，`getTest`

## 2023 年 5 月 5 日

修改 `getAllPapers` 接口，要求提供 `skip` 和 `limit` 参数。

覆写 `console.log` 实现记录时间、log 位置功能。
