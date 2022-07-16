# whistle.automock

whistle.automock 是[whistle](https://github.com/avwo/whistle)的一个扩展脚本插件，包括以下功能

- 实时生成捕获接口的 mock 文件
- 管理 mock 文件

# 安装

$ w2 install whistle.automock

# 用法

### 配置 [whistle 规则](https://avwo.github.io/whistle/rules/)

> mode 有三种选项 pathname | href | pattern，默认是 pathname

```text
pattern automock://[mode]
```

### 生成 mock 文件

---

#### pathname 模式：使用接口的 origin + pathname 作为文件名

```text
pattern automock://  或者 pattern automock://pathname
```

---

#### href 模式：使用接口的 路径 作为文件名

```text
pattern automock://href

```

---

#### pattern 模式：使用 pattern 作为文件名

```text
pattern automock://pattern
```

---

### 开始 mock

第一步：开启文件的 mock 开关，系统生成一条规则：

```
文件名 resBody:{文件内容}
```

第二步：在 Response 面板管理文件内容

手动添加文件

- 如果需要提前生成 mock 文件，可手动添加（通常不需要手动添加，通过实时捕获接口即可生成 mock 文件）

编辑文件

- 支持文件编辑

多版本

- 支持新增不同版本的文件内容
- 其中 source 版本是默认生成的，是原始接口响应数据，支持修改

切换 mock 文件

- mock 返回内容使用当前选中的版本
