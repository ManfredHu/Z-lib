/**
 * DOM加载完毕的监视函数
 * @param  {[funtion]} f [DOM加载完毕要执行的函数]
 * @return {[type]}   [description]
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

//跨浏览器添加事件绑定，与EventUtil的区别是支持多事件顺序绑定
function addEvent(obj, type, fn) {
    if (obj.addEventListener) {
        //DOM2级方法添加事件，false代表在冒泡阶段捕获事件
        obj.addEventListener(type, fn, false);
    } else {
        //创建一个存放事件的哈希表(散列表)
        if (!obj.events) {
            obj.events = {};
        }
        //第一次执行时执行
        if (!obj.events[type]) {
            //创建一个存放事件处理函数的数组
            obj.events[type] = [];
            //把第一次的事件处理函数先储存到第一个位置上
            if (obj['on' + type]) 
            	obj.events[type][0] = fn;
        } else {
            //同一个注册函数进行屏蔽，不添加到计数器中
            if (addEvent.equal(obj.events[type], fn)) {
                return false;
            }
        }
        //从第二次开始我们用事件计数器来存储
        obj.events[type][addEvent.ID++] = fn;
        //执行事件处理函数
        obj['on' + type] = addEvent.exec;
    }
}

//为每个事件分配一个计数器
addEvent.ID = 1;

//执行事件处理函数
addEvent.exec = function(event) {
    //跨浏览器获取event对象，并且当event为IE的window.event对象的时候
    //将IE的window.event特有属性封装成类似W3C的模样
    //在第一次添加事件处理的时候重写全部event对象的方法并使之符合标准模式
    var e = event || addEvent.fixEvent(window.event);
    var es = this.events[e.type];
    for (var i in es) {
        es[i].call(this, e);
    }
};

//同一个注册函数进行屏蔽，默认只能添加一样的函数一次
addEvent.equal = function(es, fn) {
    for (var i in es) {
        if (es[i] == fn) return true;
    }
    return false;
}

//把IE常用的Event对象配对到W3C中去
addEvent.fixEvent = function(event) {
    event.preventDefault = addEvent.fixEvent.preventDefault;
    event.stopPropagation = addEvent.fixEvent.stopPropagation;
    event.target = event.srcElement;
    return event;
};

//IE阻止默认行为
addEvent.fixEvent.preventDefault = function() {
    this.returnValue = false;
};

//IE取消冒泡
addEvent.fixEvent.stopPropagation = function() {
    this.cancelBubble = true;
};
//---------------------------------------------------------------------------------
//跨浏览器删除事件
function removeEvent(obj, type, fn) {
    if (typeof obj.removeEventListener != 'undefined') {
        obj.removeEventListener(type, fn, false);
    } else {
        if (obj.events) {
            for (var i in obj.events[type]) {
                if (obj.events[type][i] == fn) {
                    delete obj.events[type][i];
                }
            }
        }
    }
}
//---------------------------------------------------------------------------------
//跨浏览器获取视口大小
function getInner() {
    if (typeof window.innerWidth != 'undefined') {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        }
    } else {
        return {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight
        }
    }
}
//---------------------------------------------------------------------------------
//跨浏览器获取页面滚动距离
function getScroll() {
    return {
        top: document.documentElement.scrollTop || document.body.scrollTop,
        left: document.documentElement.scrollLeft || document.body.scrollLeft
    }
}
//---------------------------------------------------------------------------------
//跨浏览器获取计算后的Style
function getStyle(element, attr) {
    var value;
    if (typeof window.getComputedStyle != 'undefined') { //W3C
        value = window.getComputedStyle(element, null)[attr];
    } else if (typeof element.currentStyle != 'undeinfed') { //IE
        value = element.currentStyle[attr];
    }
    return value;
}
//---------------------------------------------------------------------------------
//判断class是否存在
function hasClass(element, className) {
    return element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}
//---------------------------------------------------------------------------------
//跨浏览器添加link规则
function insertRule(sheet, selectorText, cssText, position) {
    if (typeof sheet.insertRule != 'undefined') { //W3C
        sheet.insertRule(selectorText + '{' + cssText + '}', position);
    } else if (typeof sheet.addRule != 'undefined') { //IE
        sheet.addRule(selectorText, cssText, position);
    }
}
//---------------------------------------------------------------------------------
//跨浏览器移出link规则
function deleteRule(sheet, index) {
    if (typeof sheet.deleteRule != 'undefined') { //W3C
        sheet.deleteRule(index);
    } else if (typeof sheet.removeRule != 'undefined') { //IE
        sheet.removeRule(index);
    }
}
//---------------------------------------------------------------------------------
//跨浏览器获取innerText
function getInnerText(element) {
    return (typeof element.textContent == 'string') ? element.textContent : element.innerText;
}
//---------------------------------------------------------------------------------
//跨浏览器设置innerText
function setInnerText(elememt, text) {
    if (typeof element.textContent == 'string') {
        element.textContent = text;
    } else {
        element.innerText = text;
    }
}
//---------------------------------------------------------------------------------
//获取某一个元素到最外层顶点的位置
function offsetTop(element) {
    var top = element.offsetTop;
    var parent = element.offsetParent;
    while (parent != null) {
        top += parent.offsetTop;
        parent = parent.offsetParent;
    }
    return top;
}
//---------------------------------------------------------------------------------
//删除前后空格,将小括号里面捕获到的空格全部删除
function trim(str) {
    return str.replace(/(^\s*)|(\s*$)/g, '');
}
//---------------------------------------------------------------------------------
//某一个值是否存在某一个数组中
function inArray(array, value) {
    for (var i in array) {
        if (array[i] === value) return true;
    }
    return false;
}
//---------------------------------------------------------------------------------
//获取某一个节点的上一个节点的索引
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
