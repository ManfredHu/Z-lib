# Z-lib
尝试封装的一个JavaScript基础库

# Z.js
包含了DOM的基本操作，选择器只支持id,class,后代选择器
封装了ready,getId,getTagName,getClass,find等等方法，实现了连缀

# Z_drag.js
一个拖动控件插件，可以对页面的元素进行拖动

# Z_serialize.js
兼容老式浏览器的表单格式化

# The MIT License (MIT)
看根目录license文件

### ZXC.prototype.getId(id)
对`document.getElementById()`的封装

### ZXC.prototype.getTagName(tag,[DOMNode])
封装`document.getElementsByTagName()`，可以传入父节点缩小遍历范围

```javascript
var a = new ZXC(); //创建对象
console.log(a.getTagName('p',a.getId('header')));
```
### ZXC.prototype.getClass()
