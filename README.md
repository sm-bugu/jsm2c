## jsm2c

将采用commonJS规范和es6的模块化代码，转译成闭包形式的代码。

### Install

```bash
npm install jsm2c -g
```

### USAGE

A simple example: the program

```
    var jsm2c = require('./index.js');
    jsm2c.setConfig({
        root: '/Users/gml/github/smui-test'
    })
    var content = jsm2c.parse('/js/test.js');
```



### 配置说明

####ns
    解释：生成闭包后，所使用的命名空间
    类型: string
    默认值：'ns'
####root
    解释：项目的根目录
    类型：string
    默认值：当前目录
    说明：注意配置项fileBasedRoot对他的影响
####fileBasedRoot
    解释：js文件中使用require的路径是否是基于root的。
    类型：boolean
    默认值：false
    说明：主要用于应对使用构建工具生成的文件，路径会被编译为基于项目root的相对路径，如fis
####compress
    解释：分析的文件是否是被压缩过的文件
    类型：boolean
    默认值：false
    说明：压缩过的文件和没压缩过的文件，代码结构不同，不能使用同一种处理方法。
####wrapJsInHtml
    解释：是否对html中的js代码添加闭包代码
    类型：boolean
    默认值：false
    说明：如果代码中的require参与运算的话，就忽略该值，为代码加上闭包。
####tmpl
    解释：css和js的引入模板





