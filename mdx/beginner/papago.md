---
title: Papago 插件 / 快捷指令
author: summerscar
description: 本教程介绍了利用Papago插件和MacOS快捷指令高效添加生词到指定词单的方法。插件需安装Tampermonkey并运行自定义脚本，快捷指令则需在Safari中添加并配置服务器地址、词单ID和用户ID。两者均需预先设置用户ID和词单ID。
date: 1
tags: ['extension']
last-modified: 1733590234778
---

# Papago 插件 / 快捷指令

## Papago 插件

[Papago](https://papago.naver.com/) 查词插件，快速创建单词到指定词单。

### 使用

1. 浏览器安装 [Tampermonkey](https://www.tampermonkey.net/) 插件
2. 创建新脚本，复制[脚本内容](https://raw.githubusercontent.com/summerscar/korean-studio/refs/heads/main/scripts/tampermonkey-create-word-from-papago.js)后粘贴到脚本编辑器并保存脚本
3. 打开 [Papago](https://papago.naver.com/) 查词页面，输入单词
4. 查词结果处会显示 创建➕ 复制📋 设置⚙️ 按钮
5. 点击设置按钮，设置 [用户ID_blank](/account#:~:text=ID%3A) 和 [词单ID_blank](/account#:~:text=dictID%3A)
6. 点击创建按钮，即可快速创建单词到指定词单

## MacOS 快捷指令

快速添加选中文本或剪贴板文本到指定词单。

### 使用

1. Safari 打开并添加 [快捷指令](https://www.icloud.com/shortcuts/fa01089cfba54bd0b7ca79d69318452c)
2. 修改 Shell 配置
	```
	SERVER_URL="https://korean.app.summerscar.me"
	DICT_ID=""
	USER_ID=""
	/* 通知推送语言 */
	LOCALE="zh-CN"
	/* 是否推送浏览器通知 */
	NOTIFICATION=false
	```
3. 执行
	- 复制文本后点击菜单栏快捷指令
	- 选中文本后，右击 - 服务 - 创建单词
