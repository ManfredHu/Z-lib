﻿/**
 * DOM加载完毕的监视函数
 * @param  {funtion} f [DOM加载完毕要执行的函数]
 */
function domReady(f) {
    // domReady.done 标示页面是否加载完成
    // domReady.ready 函数执行队列
    // domReady.timer 周期函数变量

    //页面加载完毕时执行的函数
    function isDOMReady() {
        if (domReady.done) {
            return false;
        }
        if (document && document.getElementById && document.getElementsByTagName && document.body) {
            clearInterval(domReady.timer);
            domReady.timer = null; //清空引用
            for (var i = 0, len = domReady.ready.length; i < len; i++) {
                domReady.ready[i]();
            }
            domReady.ready = null;
            domReady.done = true;
            removeEvent(window, 'load', arguments.callee);
            removeEvent(document, 'DOMContentLoaded', arguments.callee);
        }
    }

    //假如DOM已经加载，则马上执行函数
    if (domReady.done) {
        return f();
    }
    //当DOM没有加载完全但是已经有了一个函数时候，添加到函数队列上
    if (domReady.timer) {
        domReady.ready.push(f);
    } else {
        //为页面加载完毕事件绑定事件
        addEvent(window, 'load', isDOMReady);
        addEvent(document, 'DOMContentLoaded', isDOMReady);
        //初始化待执行函数的数组
        domReady.ready = [f];
        //循环检测DOM是否可用
        domReady.timer = setInterval(isDOMReady, 13);
    }
}

/**
 * 跨浏览器添加事件绑定，舍弃了IE的attachEvent事件（有bug）
 * @param {DOMNode}   obj  [要绑定的事件对象]
 * @param {string}    type [绑定的事件，如click]
 * @param {Function}  fn   [回调函数]
 */
function addEvent(obj, type, fn) {
    if (obj.addEventListener) {
        //DOM2级方法添加事件，false代表在冒泡阶段捕获事件
        obj.addEventListener(type, fn, false);
    } else {
        //创建一个存放事件的哈希表(散列表)
        if (!obj.events) {
            obj.events = {};
        }
        if (!obj.events[type]) {
            //创建一个存放事件处理函数的数组
            obj.events[type] = [];
        } else {
            //同一个注册函数进行屏蔽，不添加到计数器中
            if (addEvent.equal(obj.events[type], fn)) {
                return false;
            }
        }
        //从第二次开始我们用事件计数器来存储
        obj.events[type][addEvent.ID++] = fn;
        //执行事件处理函数队列
        obj['on' + type] = addEvent.exec;
    }
}

//为每个事件类型分配一个计数器
addEvent.ID = 0;

//执行事件处理函数
addEvent.exec = function(event) {
    //跨浏览器获取event对象，并且当event为IE的window.event对象的时候
    //将IE的window.event特有属性封装成类似W3C的模样
    //在第一次添加事件处理的时候重写全部event对象的方法并使之符合标准模式
    var e = event || addEvent.fixEvent(window.event);
    //拿到对象类别事件的函数队列
    var es = this.events[e.type];
    //顺序执行
    for (var i in es) {
        es[i].call(this, e);
    }
};

//同一个注册函数进行屏蔽
//一个函数绑定同个对象的同个事件默认会被忽略
addEvent.equal = function(es, fn) {
    for (var i in es) {
        if (es[i] === fn)
            return true;
    }
    return false;
};

//模拟W3C的Event对象，修复IE的Event对象
//已修复preventDefault/stopPropagation/target（常用）
//滚轮或者剪贴板等需要自行添加
addEvent.fixEvent = function(event) {
    event.preventDefault = addEvent.fixEvent.preventDefault;
    event.stopPropagation = addEvent.fixEvent.stopPropagation;
    event.target = event.srcElement;
    return event;
};

//IE阻止默认行为fix
addEvent.fixEvent.preventDefault = function() {
    this.returnValue = false;
};

//IE取消冒泡fix
addEvent.fixEvent.stopPropagation = function() {
    this.cancelBubble = true;
};

/**
 * 跨浏览器删除事件
 * @param  {[DOMNode]}   obj  [要删除事件的对象]
 * @param  {[string]}    type [事件类型]
 * @param  {Function}    fn   [回调函数]
 */
function removeEvent(obj, type, fn) {
    if (obj.removeEventListener) {
        obj.removeEventListener(type, fn, false);
    } else {
        if (obj.events) {
            for (var i in obj.events[type]) {
                if (obj.events[type][i] === fn) {
                    delete obj.events[type][i];
                }
            }
        }
    }
}

/**
 * 跨浏览器获取视口大小
 * @return {[Object]} [返回一个包含宽度和高度的对象]
 */
function getInner() {
	var width = window.innerWidth,
		height = window.innerHeight;

    if (typeof width !== 'number') { //IE
    	if(document.compatMode === 'CSS1Compat'){
    		return {
    		    width: document.documentElement.clientWidth,
    		    height: document.documentElement.clientHeight
    		}	
    	}
    	return {
    	    width: document.body.clientWidth,
    	    height: document.body.clientHeight
    	}
    } else { //W3C标准
    	return {
    	    width: window.innerWidth,
    	    height: window.innerHeight
    	}
    }
}

/**
 * 跨浏览器获取页面滚动距离
 * @return {[Object]} [包含top和left的对象]
 */
function getScroll() {
    return {
        top: document.documentElement.scrollTop || document.body.scrollTop,
        left: document.documentElement.scrollLeft || document.body.scrollLeft
    }
}

/**
 * 跨浏览器获取计算后的Style
 * @param  {[DOMNode]} element [元素]
 * @param  {[String]}  attr    [样式属性]
 * @return {[type]}            [返回对应样式属性的值]
 */
function getStyle(element, attr) {
    var value;
    if (window.getComputedStyle) { //W3C
        value = window.getComputedStyle(element, null)[attr];
    } else if (element.currentStyle) { //IE
        value = element.currentStyle[attr];
    }
    return value;
}

/**
 * 判断class是否存在
 * @param  {[DOMNode]} element   [元素]
 * @param  {[String]}  className [类的名称]
 * @return {Boolean}             [返回true或false]
 */
function hasClass(element, className) {
    return element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}

/**
 * 跨浏览器添加link规则
 * 动态添加样式（用的比较少）
 * @param  {[type]} sheet        [样式表]
 * @param  {[type]} selectorText [选择器]
 * @param  {[type]} cssText      [要插入的CSS主体]
 * @param  {[type]} position     [位置]
 */
function insertRule(sheet, selectorText, cssText, position) {
    if (sheet.insertRule) { //W3C
        sheet.insertRule(selectorText + '{' + cssText + '}', position);
    } else if (sheet.addRule) { //IE
        sheet.addRule(selectorText, cssText, position);
    }
}

/**
 * 跨浏览器移出link规则
 * 动态删除样式（用的比较少）
 * @param  {[type]} sheet [样式表]
 * @param  {[type]} index [序号]
 */
function deleteRule(sheet, index) {
    if (typeof sheet.deleteRule != 'undefined') { //W3C
        sheet.deleteRule(index);
    } else if (typeof sheet.removeRule != 'undefined') { //IE
        sheet.removeRule(index);
    }
}

/**
 * 跨浏览器获取innerText
 * @param  {[DOMNode]} element [要获取文本内容的元素]
 * @return {[String]}          [元素文本的内容]
 */
function getInnerText(element) {
    return (typeof element.textContent === 'string') ? element.textContent : element.innerText;
}

/**
 * 跨浏览器设置innerText
 * @param {[DOMNode]} elememt [要设置文本内容的元素]
 * @param {[String]}  text    [要设置的文本]
 */
function setInnerText(element, text) {
    if (typeof element.textContent === 'string') {
        element.textContent = text;
    } else {
        element.innerText = text;
    }
}

/**
 * 获取某一个元素到最外层顶点的位置
 * @param  {[type]} element [要获取位置的元素]
 * @return {[number]}       [距离顶部的位置]
 */
function offsetTop(element) {
    var top = element.offsetTop;
    var parent = element.offsetParent;
    while (parent != null) {
        top += parent.offsetTop;
        parent = parent.offsetParent;
    }
    return top;
}

/**
 * 删除前后空格,将小括号里面捕获到的空格全部删除
 * @param  {[String]} str [要删除前后空格的字符串]
 * @return {[String]}     [处理后的字符串]
 */
function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, '');
}

/**
 * 某一个值是否存在某一个数组中
 * @param  {[Array]} array [数组项]
 * @param  {[type]}  value [要判断的项]
 * @return {[boolean]}     [true或false]
 */
function inArray(array, value) {
    for (var i in array) {
        if (array[i] === value) return true;
    }
    return false;
}

/**
 * 获取某一个节点的上一个节点的索引
 * @param  {[type]} current [description]
 * @param  {[type]} parent  [description]
 * @return {[type]}         [description]
 */
function prevIndex(current, parent) {
    var length = parent.children.length;
    if (current == 0) return length - 1;
    return parseInt(current) - 1;
}
//---------------------------------------------------------------------------------
//获取某一个节点的下一个节点的索引
function nextIndex(current, parent) {
    var length = parent.children.length;
    if (current == length - 1) return 0;
    return parseInt(current) + 1;
}
//---------------------------------------------------------------------------------
//滚动条固定
function fixedScroll() {
    //让页面立即返回原来的位置
    window.scrollTo(fixedScroll.left, fixedScroll.top);
}
//---------------------------------------------------------------------------------
//阻止默认行为
function predef(e) {
    e.preventDefault();
}
//---------------------------------------------------------------------------------
//创建cookie
function setCookie(name, value, expires, path, domain, secure) {
    var cookieText = encodeURIComponent(name) + '=' + encodeURIComponent(value);
    if (expires instanceof Date) {
        cookieText += '; expires=' + expires;
    }
    if (path) {
        cookieText += '; expires=' + expires;
    }
    if (domain) {
        cookieText += '; domain=' + domain;
    }
    if (secure) {
        cookieText += '; secure';
    }
    document.cookie = cookieText;
}
//---------------------------------------------------------------------------------
//获取cookie
function getCookie(name) {
    var cookieName = encodeURIComponent(name) + '=';
    var cookieStart = document.cookie.indexOf(cookieName);
    var cookieValue = null;
    if (cookieStart > -1) {
        var cookieEnd = document.cookie.indexOf(';', cookieStart);
        if (cookieEnd == -1) {
            cookieEnd = document.cookie.length;
        }
        cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
    }
    return cookieValue;
}
//---------------------------------------------------------------------------------
//删除cookie
function unsetCookie(name) {
    document.cookie = name + "= ; expires=" + new Date(0);
}
