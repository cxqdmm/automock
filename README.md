# whistle.automock

whistle.automock 是[whistle](https://github.com/avwo/whistle)的一个扩展脚本插件，包括以下功能

1. 自动生成 mock 文件:
   - 实时捕获命中[whistle 规则](https://avwo.github.io/whistle/rules/)的接口
   - 实时生成捕获接口的 mock 文件
2. 管理 mock 文件:
   - mock 开关：开启状态下，会用文件的内容作为关联接口的响应
   - 编辑：mock 开启时，文件内容只能通过手动修改变更，mock 关闭时，会根据命中的接口实时刷新文件内容
   - 删除
3. 多种 mock 模式:

   - pathname 模式：使用捕获接口的 origin + pathname 作为 mock 文件的文件名， 在开启 mock 时，当接口的 origin + pathname 等于文件名时则命中 mock

     ```text
     whistle rule:
     https://www.a.com/get/name automock:// 或者 https://www.a.com/get/name automock://pathname

     接口url:
     https://www.a.com/get/name
     https://www.a.com/get/name?a=1
     https://www.a.com/get/name?a=2

     上面三个接口会命中同一个mock文件
     ```

   - href 模式：使用捕获接口的 完整 url 作为 mock 文件的文件名， 在开启 mock 时，当接口的 url 等于文件名时则命中 mock

     ```text
      whistle rule:
      https://www.a.com automock://href

      接口url：
      https://www.a.com/get/name
      https://www.a.com/get/name?a=1
      https://www.a.com/get/name?a=2

      上面三个接口命中的mock文件各不相同
     ```

4. mock 文件支持版本管理
   - source 原接口响应，开启 mock 后，可通过编辑修改响应值，主要用在临时 mock 场景，无需长久保存 mock 数据
   - 新增版本 主要用于创建 mock 的多个副本，适用于需要长久保存 mock 数据的场景

# 安装

$ w2 install whistle.automock

# 用法

### 配置[whistle 规则](https://avwo.github.io/whistle/rules/)

pathname 模式

www.xxx.com automock:// 或者 www.xxx.com automock://pathname

href 模式
www.xxx.com automock://href

### 文件管理

在 plugins 面板找到 automock,进入 automock 面板
