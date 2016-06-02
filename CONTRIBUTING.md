##代码贡献规范

有任何疑问，欢迎提交 [issue](https://github.com/smocean/jsm2c/issues)，
或者直接修改提交 [PR](https://github.com/smocean/jsm2c/pulls)!

### 代码风格

你的代码风格必须通过 eslint，你可以运行 `make lint` 本地测试。

### Commit 提交规范

根据 [angular 规范](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit-message-format)提交 commit，
这样 history 看起来更加清晰，还可以自动生成 changelog。

```xml
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

（1）type

提交 commit 的类型，包括以下几种

- feat: 新功能
- fix: 修复问题
- docs: 修改文档
- style: 修改代码格式，不影响代码逻辑
- refactor: 重构代码，理论上不影响现有功能
- perf: 提升性能
- test: 增加修改测试用例
- chore: 修改工具相关（包括但不限于文档、代码生成等）
- deps: 升级依赖

（2）scope

修改文件的范围（包括但不限于 doc, middleware, proxy, core, config, plugin）

（3）subject

用一句话清楚的描述这次提交做了什么

（4）body

补充 subject，适当增加原因、目的等相关因素，也可不写。

（5）footer
- ___当有非兼容修改(Breaking Change)时必须在这里描述清楚___
- 关联相关 issue，如 `Closes #1, Closes #2, #3`

示例

```
fix($compile): [BREAKING_CHANGE] couple of unit tests for IE9

Older IEs serialize html uppercased, but IE9 does not...
Would be better to expect case insensitive, unfortunately jasmine does
not allow to user regexps for throw expectations.

Document change on egg/doc!123

Closes #392

BREAKING CHANGE:

  Breaks foo.bar api, foo.baz should be used instead
```

查看具体[文档](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit)

## 开发流程

### fork并克隆项目

1. 访问 https://github.com/smocean/sphinxjs 并 fork 到自己的仓库。
2. clone你fork后的项目，以ybbjegj用户为例

```
    git clone git@github.com:ybbjegj/sphinxjs.git
```

### 添加项目上游

将原sphinx项目的github地址添加到你项目的上游。

```
//upstream 自己指定名称，这里以upstream为例
git remote add upstream git@github.com:smocean/jsm2c.git

```

### 下载依赖包

```
make autod
```
Tips：如果在代码中使用到了新的依赖包，也可以使用该方法，禁止人工维护package.json

### 开发步骤

1、 切换到开发分支

```
    git checkout dev

```

2、在开始一个新的功能之前，要同步你的fork，确保是在最新的版本中工作

```
    git pull --rebase upstream dev
```

3、完成新功能和测试用例开发。

```
    make auto-test  // 启动本地测试
```

4、提交到自己的仓库

```
    git add .

    git commit -m '修改信息'

    git pull --rebase upstream dev

    git push origin dev

```
5、在github上发Pull Request 等待合并。

注意:

1、不要有多余的commit，如何避免参考 [使用git rebase合并多次commit](http://blog.csdn.net/yangcs2009/article/details/47166361);


2、测试框架[mocha入门] (http://www.ruanyifeng.com/blog/2015/12/a-mocha-tutorial-of-examples.html);

3、断言[chai] (http://chaijs.com/api/)









