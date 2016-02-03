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

### domReady(f)
`f`为要添加的页面加载完执行的函数
DOM加载完毕的监视函数，当`$()`传入的是函数的时候，会将函数传入`ZXC.prototype.ready`。这里会调用`domReady`函数。

### addEvent(obj, type, fn)

- `obj`为要绑定事件的对象
- `type`为事件名称如`click`
- `fn`为回调函数

事件绑定函数，实现了事件队列，弃用了IE的`attachEvent`,因为有很多bug。

### removeEvent(obj, type, fn)
移除事件绑定的函数

```javascript
function bb() {
    alert('1');
} 
function bb2() {
    alert('2');
}
function bb3() {
    alert('3');
} 
addEvent(window,'load',bb);
removeEvent(window,'load',bb)
addEvent(window,'load',bb2); //2
addEvent(window,'load',bb3); //3
```

### getInner
跨浏览器获取视口大小,返回一个包含`width`和`height`的对象。

### getScroll
跨浏览器获取页面滚动距离,返回一个包含距顶部`top`和左部`left`的对象

### getStyle(element, attr)

- `element`获取即时CSS样式的对象
- `attr`要获取的属性

跨浏览器获取计算后的Style

```javascript
var dd = document.getElementsByTagName('h1');
var a = getStyle(dd[0], 'fontSize');
console.log(a); // 32px
```
### hasClass(element, className)

- `element`要判断`className`的对象
- `className`要判断的类名

判断元素的类名是否有`className`的类名，返回`true`或者`false`

### insertRule(sheet, selectorTextcssText, position)
动态插入样式（用的很少）

### deleteRule(sheet, index)
动态删除样式（用的很少）

### getInnerText(element)
跨浏览器获取文本内容,`element`为要获取文本内容的节点

### setInnerText(elememt, text)
跨浏览器设置文本内容,`element`为要设置文本内容的节点,`text`为文本内容

```javascript
var dd = document.getElementsByTagName('h1');
var a = getInnerText(dd[0]);
console.log(a); //That is header 1
setInnerText(dd[0],'这是标题1');
```
### offsetTop(element)
### trim(str)
### inArray(array, value)
### prevIndex(current, parent)


