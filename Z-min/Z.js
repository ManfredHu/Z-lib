/*---------------------------------------------------------------------------------
//封装Ajax
ajax({
	type  	: 'post',
	url 	: 'postPage.jsp',
	data 	: $('form').eq(0).serialize(),
	success : function (text) {
		//do something
	},
	async 	: false
});

1.success的函数会在callback()里面调用,而callback()会在同步或者异步完成的时候调用，
  就是说success会在执行成功返回的时候调用，不管是同步还是异步
2.ajax()严格遵循调用顺序以兼容浏览器
  new XMLHttpRequest --> onreadystatechange --> open --> setRequestHeader --> send
---------------------------------------------------------------------------------*/
ZXC.ajax = function(obj) {
    //合并CreatXHR()函数为立即调用
    //创建XHR对象，没用@lazy loading
    var xhr = (function() {
        if (typeof XMLHttpRequest != 'undefined') {
            return new XMLHttpRequest();
        } else if (typeof ActiveXObject != 'undefined') {
            var version = [
                'MSXML2.XMLHttp.6.0',
                'MSXML2.XMLHttp.3.0',
                'MSXML2.XMLHttp'
            ];
            for (var i = 0; version.length; i++) {
                try {
                    return new ActiveXObject(version[i]);
                } catch (e) {
                    //跳过
                }
            }
        } else {
            throw new Error('ajax():系统或浏览器不支持XHR对象');
        }
    })();

    //对url绑定randID
    obj.url = obj.url + '?rand=' + Math.random();

    //合并params(data)函数为立即调用
    //对传输的数据进行URI编码
    obj.data = (function(data) {
        var arr = [];
        for (var i in data) {
            arr.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));
        }
        return arr.join('&');
    })(obj.data);

    //如果是get则url加上&
    if (obj.type === 'get')
        obj.url += obj.url.indexOf('?') == -1 ? '?' + obj.data :
        '&' + obj.data;

    //如果是异步Ajax
    if (obj.async === true) {
        xhr.onreadystatechange = function() {
            //当响应完成的时候执行回调函数
            if (xhr.readyState == 4) {
                callback();
            }
        };
    }

    //XMLHttpRequest的open
    xhr.open(obj.type, obj.url, obj.async);

    //如果是表单则设置表单报头，不是则发送null
    if (obj.type === 'post') {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(obj.data);
    } else {
        xhr.send(null);
    }

    //如果是同步则马上执行callback()
    if (obj.async === false) {
        callback();
    }

    //同步回调callback函数
    function callback() {
        //成功返回或者是缓存的时候
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
            obj.success(xhr.responseText); //回调传递参数
        } else {
            throw new Error('ajax():获取数据错误！错误代号：' + xhr.status + '，错误信息：' + xhr.statusText);
        }
    }
};

;
//将兼容代码挂载到ZXC函数对象中的tool属性上
ZXC.tool = {
    /**
     * DOM加载完毕的监视函数
     * @param  {funtion} f [DOM加载完毕要执行的函数]
     */
    var domReady = function(f) {
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
    };

    /**
     * 跨浏览器添加事件绑定，舍弃了IE的attachEvent事件（有bug）
     * @param {DOMNode}   obj  [要绑定的事件对象]
     * @param {string}    type [绑定的事件，如click]
     * @param {Function}  fn   [回调函数]
     */
    var addEvent = function(obj, type, fn) {
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
    var removeEvent = function(obj, type, fn) {
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
    };

    /**
     * 跨浏览器获取视口大小
     * @return {[Object]} [返回一个包含宽度和高度的对象]
     */
    var getInner = function() {
        var width = window.innerWidth,
            height = window.innerHeight;

        if (typeof width !== 'number') { //IE
            if (document.compatMode === 'CSS1Compat') {
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
    };

    /**
     * 跨浏览器获取页面滚动距离
     * @return {[Object]} [包含top和left的对象]
     */
    var getScroll = function() {
        return {
            top: document.documentElement.scrollTop || document.body.scrollTop,
            left: document.documentElement.scrollLeft || document.body.scrollLeft
        }
    };

    /**
     * 跨浏览器获取计算后的Style
     * @param  {[DOMNode]} element [元素]
     * @param  {[String]}  attr    [样式属性]
     * @return {[type]}            [返回对应样式属性的值]
     */
    var getStyle = function(element, attr) {
        var value;
        if (window.getComputedStyle) { //W3C
            value = window.getComputedStyle(element, null)[attr];
        } else if (element.currentStyle) { //IE
            value = element.currentStyle[attr];
        }
        return value;
    };

    /**
     * 判断class是否存在
     * @param  {[DOMNode]} element   [元素]
     * @param  {[String]}  className [类的名称]
     * @return {Boolean}             [返回true或false]
     */
    var hasClass = function(element, className) {
        return element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
    };

    /**
     * 跨浏览器获取innerText
     * @param  {[DOMNode]} element [要获取文本内容的元素]
     * @return {[String]}          [元素文本的内容]
     */
    var getInnerText = function(element) {
        return (typeof element.textContent === 'string') ? element.textContent : element.innerText;
    };

    /**
     * 跨浏览器设置innerText
     * @param {[DOMNode]} elememt [要设置文本内容的元素]
     * @param {[String]}  text    [要设置的文本]
     */
    var setInnerText = function(element, text) {
        if (typeof element.textContent === 'string') {
            element.textContent = text;
        } else {
            element.innerText = text;
        }
    };

    /**
     * 获取某一个元素到最外层顶点的位置
     * @param  {[type]} element [要获取位置的元素]
     * @return {[number]}       [距离顶部的位置]
     */
    var offsetTop = function(element) {
        var top = element.offsetTop;
        var parent = element.offsetParent;
        while (parent != null) {
            top += parent.offsetTop;
            parent = parent.offsetParent;
        }
        return top;
    };

    /**
     * 删除前后空格,将小括号里面捕获到的空格全部删除
     * @param  {[String]} str [要删除前后空格的字符串]
     * @return {[String]}     [处理后的字符串]
     */
    var trim = function(str) {
        return str.replace(/(^\s*)|(\s*$)/g, '');
    };

    /**
     * 某一个值是否存在某一个数组中
     * @param  {[Array]} array [数组项]
     * @param  {[type]}  value [要判断的项]
     * @return {[boolean]}     [true或false]
     */
    var inArray = function(array, value) {
        for (var i in array) {
            if (array[i] === value) return true;
        }
        return false;
    };

    /**
     * 获取某一个节点的上一个节点的索引
     * @param  {[type]} current [description]
     * @param  {[type]} parent  [description]
     * @return {[type]}         [description]
     */
    var prevIndex = function(current, parent) {
        var length = parent.children.length;
        if (current == 0) return length - 1;
        return parseInt(current) - 1;
    };

    /**
     * 获取某一个节点的下一个节点的索引
     * @param  {[type]} current [description]
     * @param  {[type]} parent  [description]
     * @return {[type]}         [description]
     */
    var nextIndex = function(current, parent) {
        var length = parent.children.length;
        if (current == length - 1) return 0;
        return parseInt(current) + 1;
    };

    /**
     * 滚动条固定(页面固定滚动到某个位置)
     */
    var fixedScroll = function() {
        //让页面立即返回原来的位置
        window.scrollTo(fixedScroll.left, fixedScroll.top);
    };

    /**
     * 阻止默认行为
     * @param  {Event} e [事件event参数]
     */
    var predef = function(e) {
        e.preventDefault();
    };
};

;
(function() {

    var $ = function(args) {
        return new ZXC(args);
    };

    /**
     * 基础库ZXC构造函数
     * @param {[String]} args [参数，可以为String/Function/DOMNode]
     */
    function ZXC(args) {
        //创建一个数组，来保存获取的节点和节点数组
        this.elements = [];
        var isSupportQuery = false;
        //是否支持querySelector
        if (document.querySelector) {
            isSupportQuery = true;
            ZXC.prototype.querySelector = function(str) {
                return document.querySelector(str);
            };
            ZXC.prototype.querySelectorAll = function(str) {
                return document.querySelectorAll(str);
            }
        }
        //当传入的是字符串的时候
        if (typeof args === 'string') {
            //有空格的情况，即有后代选择器，如#header p
            if (args.indexOf(' ') !== -1) {
                var elements = args.split(' '); //把节点拆开分别保存到数组里
                var childElements = []; //存放临时节点对象的数组，解决被覆盖的问题
                var node = []; //用来存放父节点用的

                for (var i = 0, ilen = elements.length; i < ilen; i++) {
                    if (node.length == 0) {
                        node.push(document); //如果默认没有父节点，就把document放入
                    }
                    childElements = []; //清理掉临时节点，以便父节点失效，子节点有效

                    //对分词的CSS选择器数组进行遍历匹配
                    switch (elements[i].charAt(0)) {
                        case '#':
                            childElements.push(this.getId(elements[i].substring(1)));
                            node = childElements; //保存父节点，因为childElements要清理，所以需要创建node数组
                            break;
                        case '.':
                            for (var j = 0, jlen = node.length; j < jlen; j++) {
                                var temps = this.getClass(elements[i].substring(1), node[j]);
                                for (var k = 0, klen = temps.length; k < klen; k++) {
                                    childElements.push(temps[k]);
                                }
                            }
                            node = childElements;
                            break;
                        default:
                            for (var j = 0, jlen = node.length; j < jlen; j++) {
                                var temps = this.getTagName(elements[i], node[j]);
                                for (var k = 0, klen = temps.length; k < klen; k++) {
                                    childElements.push(temps[k]);
                                }
                            }
                            node = childElements;
                    }
                }
                this.elements = childElements;

            } else { //传入的是单纯的标签，没有空格，则没有后代选择
                switch (args.charAt(0)) { //find模拟
                    case '#':
                        this.elements.push(this.getId(args.substring(1)));
                        break;
                    case '.':
                        this.elements = this.getClass(args.substring(1));
                        break;
                    default:
                        this.elements = this.getTagName(args);
                }
            }

            //当传入的是对象的时候，对对象进行封装
        } else if (typeof args === 'object') {
            if (args !== null) { //排除typeof null为object的情况
                this.elements[0] = args;
            }

            //当传入的是函数的时候
        } else if (typeof args === 'function') {
            this.ready(args);
        }
    };

    /**
     * ready接口，页面加载完成时调用fn函数
     * @param  {Function} fn [回调函数]
     */
    ZXC.prototype.ready = function(fn) {
        ZXC.tool.domReady(fn);
    };

    /**
     * 获取ID节点
     * @param  {[String]} id [ID]
     * @return {[Array]}     [封装的数组]
     */
    ZXC.prototype.getId = function(id) {
        return document.getElementById(id);
    };

    /**
     * 获取元素节点数组
     * @param  {[String]}  tag        [标签名]
     * @param  {[DOMNode]} parentNode [父节点]
     * @return {[Array]}              [封装的数组]
     */
    ZXC.prototype.getTagName = function(tag, parentNode) {
        var node = parentNode || document;
        var temps = [];
        var tags = node.getElementsByTagName(tag);
        for (var i = 0, len = tags.length; i < len; i++) {
            temps.push(tags[i]);
        }
        return temps;
    };

    /**
     * 获取CLASS节点数组
     * @param  {String} className   [类名]
     * @param  {DOMNode} parentNode [父节点]
     * @return {Array}              [节点数组]
     */
    ZXC.prototype.getClass = function(className, parentNode) {
        var node = null,
            temps = [];

        //没有缩小范围且支持document.querySelectorAll方法
        //将NodeList数组转化为数组
        if (typeof parentNode === "undefined" && document.querySelectorAll) {
            temps = Array.prototype.slice.call(document.querySelectorAll('.' + className));
        } else {
            if (parentNode !== undefined) {
                node = parentNode;
            } else {
                node = document;
            }
            var all = node.getElementsByTagName('*');
            for (var i = 0, len = all.length; i < len; i++) {
                if ((new RegExp('(\\s|^)' + className + '(\\s|$)')).test(all[i].className)) {
                    temps.push(all[i]);
                }
            }
        }
        return temps;
    };

    /**
     * 设置CSS选择器子节点
     * @param  {[String]} str [选择器]
     * @return {[ZXC]}        [ZXC对象]
     */
    ZXC.prototype.find = function(str) {
        var childElements = [];
        for (var i = 0, len = this.elements.length; i < len; i++) {
            switch (str.charAt(0)) {
                case '#':
                    childElements.push(this.getId(str.substring(1)));
                    break;
                case '.':
                    var temps = this.getClass(str.substring(1), this.elements[i]);
                    for (var j = 0; j < temps.length; j++) {
                        childElements.push(temps[j]);
                    }
                    break;
                default:
                    var temps = this.getTagName(str, this.elements[i]);
                    for (var j = 0; j < temps.length; j++) {
                        childElements.push(temps[j]);
                    }
            }
        }
        this.elements = childElements;
        return this;
    };

    /**
     * 获取某一个节点，并返回这个节点对象(注意只有一个元素)
     * @param  {Number} num  [获取数组的第几个元素]
     * @return {DomNode}     [返回数组的第几个元素节点]
     */
    ZXC.prototype.ge = function(num) {
        return this.elements[num];
    };

    /**
     * 获取首个节点，并返回这个节点对象(注意只有一个元素)
     * @return {DomNode} [返回数组的第1个元素节点]
     */
    ZXC.prototype.first = function() {
        return this.elements[0];
    };

    /**
     * 获取末个节点，并返回这个节点对象(注意只有一个元素)
     * @return {DomNode} [返回数组的最后1个元素节点]
     */
    ZXC.prototype.last = function() {
        return this.elements[this.elements.length - 1];
    };

    /**
     * 获取某组节点的数量
     * @return {Number} [返回ZXC对象的element数组的长度]
     */
    ZXC.prototype.length = function() {
        return this.elements.length;
    };

    /**
     * 获取某一个节点的属性
     * @param  {[String]} attr  [属性]
     * @param  {[String]} value [值]
     * @return {[ZXC]}          [返回ZXC对象]
     */
    ZXC.prototype.attr = function(attr, value) {
        for (var i = 0; i < this.elements.length; i++) {
            if (arguments.length == 1) {
                return this.elements[i].getAttribute(attr);
            } else if (arguments.length == 2) {
                this.elements[i].setAttribute(attr, value);
            }
        }
        return this;
    };

    /**
     * 获取某一个节点在整个节点组中是第几个索引
     * @return {[Number]} [返回对象在父元素中的索引]
     */
    ZXC.prototype.index = function() {
        var children = this.elements[0].parentNode.children;
        for (var i = 0, len = children.length; i < len; i++) {
            if (this.elements[0] == children[i]) return i;
        }
    };

    /**
     * 跨浏览器设置某一个节点的透明度
     * @param  {[Number]} num [透明度数值，值为0-100而不是0-1]
     * @return {[ZXC]}        [返回ZXC对象]
     */
    ZXC.prototype.opacity = function(num) {
        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].style.opacity = num / 100;
            this.elements[i].style.filter = 'alpha(opacity=' + num + ')';
        }
        return this;
    };

    /**
     * 获取某一个节点，并且ZXC对象
     * @param  {Number} num [序号]
     * @return {ZXC}        [ZXC对象]
     */
    ZXC.prototype.eq = function(num) {
        var element = this.elements[num];
        this.elements = [];
        this.elements[0] = element;
        return this;
    };

    /**
     * 获取当前节点的下一个元素节点
     * @return {DOMNode} [下一个兄弟节点]
     */
    ZXC.prototype.next = function() {
        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i] = this.elements[i].nextSibling;
            if (this.elements[i] == null) throw new Error('next():找不到下一个同级元素节点！'); //IEbug
            if (this.elements[i].nodeType == 3) this.next();
        }
        return this;
    };

    /**
     * 获取当前节点的上一个元素节点
     * @return {DOMNode} [前一个兄弟节点]
     */
    ZXC.prototype.prev = function() {
        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i] = this.elements[i].previousSibling;
            if (this.elements[i] == null) throw new Error('prev():找不到上一个同级元素节点！'); //IEbug
            if (this.elements[i].nodeType == 3) this.prev();
        }
        return this;
    };

    /**
     * 设置CSS
     * @param  {[String]} attr  [属性]
     * @param  {[String]} value [值（可选，没有则为获取属性值）]
     * @return {[ZXC]}          [ZXC对象]
     */
    ZXC.prototype.css = function(attr, value) {
        for (var i = 0, len = this.elements.length; i < len; i++) {
            //获取属性
            if (arguments.length == 1) {
                return ZXC.tool.getStyle(this.elements[i], attr);
            }
            //设置属性
            this.elements[i].style[attr] = value;
        }
        return this;
    };

    /**
     * 添加Class
     * @param {[String]} className [类名]
     * @return {[ZXC]}             [ZXC对象]
     */
    ZXC.prototype.addClass = function(className) {
        for (var i = 0; i < this.elements.length; i++) {
            if (!ZXC.tool.hasClass(this.elements[i], className)) {
                this.elements[i].className += ' ' + className;
            }
        }
        return this;
    };

    /**
     * 移除Class
     * @param  {[String]} className [类名]
     * @return {[ZXC]}              [ZXC对象]
     */
    ZXC.prototype.removeClass = function(className) {
        for (var i = 0; i < this.elements.length; i++) {
            if (ZXC.tool.hasClass(this.elements[i], className)) {
                this.elements[i].className = this.elements[i].className.replace(new RegExp('(\\s|^)' + className + '(\\s|$)'), ' ');
            }
        }
        return this;
    };

    /**
     * 动态添加link或style的CSS规则
     * @param {[type]} num          [description]
     * @param {[type]} selectorText [description]
     * @param {[type]} cssText      [description]
     * @param {[type]} position     [description]
     */
    ZXC.prototype.addRule = function(num, selectorText, cssText, position) {
        var sheet = document.styleSheets[num];
        insertRule(sheet, selectorText, cssText, position);
        return this;
    };

    /**
     * 动态移除link或style的CSS规则
     * @param  {[type]} num   [description]
     * @param  {[type]} index [description]
     * @return {[type]}       [description]
     */
    ZXC.prototype.removeRule = function(num, index) {
        var sheet = document.styleSheets[num];
        deleteRule(sheet, index);
        return this;
    };

    /**
     * 设置表单字段元素
     * @param  {[String]} name [表单元素的name]
     * @return {[ZXC]}         [ZXC对象]
     */
    ZXC.prototype.form = function(name) {
        for (var i = 0, len = this.elements.length; i < len; i++) {
            this.elements[i] = this.elements[i][name];
        }
        return this;
    };

    /**
     * 设置表单字段内容获取
     * @param  {[String]} str [获取元素的值]
     * @return {[ZXC]}        [ZXC对象]
     */
    ZXC.prototype.value = function(str) {
        for (var i = 0; i < this.elements.length; i++) {
            if (arguments.length == 0) {
                return this.elements[i].value;
            }
            this.elements[i].value = str;
        }
        return this;
    };

    /**
     * 设置innerHTML
     * @param  {[String]} str [设置元素的innerHTML]
     * @return {[ZXC]}        [ZXC对象]
     */
    ZXC.prototype.html = function(str) {
        for (var i = 0; i < this.elements.length; i++) {
            if (arguments.length == 0) {
                return this.elements[i].innerHTML;
            }
            this.elements[i].innerHTML = str;
        }
        return this;
    };

    /**
     * 设置innerText
     * @param  {[String]} str [设置文本内容]
     * @return {[ZXC]}        [ZXC对象]
     */
    ZXC.prototype.text = function(str) {
        for (var i = 0; i < this.elements.length; i++) {
            if (arguments.length == 0) {
                return ZXC.tool.getInnerText(this.elements[i]);
            }
            ZXC.tool.setInnerText(this.elements[i], text);
        }
        return this;
    };

    /**
     * 设置事件发生器
     * @param  {[String]}   event [事件名称]
     * @param  {Function}   fn    [回调函数]
     * @return {[ZXC]}            [ZXC对象]
     */
    ZXC.prototype.bind = function(event, fn) {
        for (var i = 0; i < this.elements.length; i++) {
            ZXC.tool.addEvent(this.elements[i], event, fn);
        }
        return this;
    };

    /**
     * 设置鼠标移入移出方法
     * @param  {[Function]} over [进入的回调函数]
     * @param  {[Function]} out  [移出的回调函数]
     * @return {[ZXC]}           [ZXC对象]
     */
    ZXC.prototype.hover = function(over, out) {
        for (var i = 0; i < this.elements.length; i++) {
            ZXC.tool.addEvent(this.elements[i], 'mouseover', over);
            ZXC.tool.addEvent(this.elements[i], 'mouseout', out);
        }
        return this;
    };


    /**
     * 设置点击切换方法
     * @param  {[Function]} func [回调函数]
     * @return {[ZXC]}           [ZXC对象]
     */
    ZXC.prototype.toggle = function(func) {
        //用arguments函数数组对this.element数组元素进行多重绑定
        for (var i = 0; i < this.elements.length; i++) {
            //立即绑定事件
            (function(element, args) {
                var count = 0;
                ZXC.tool.addEvent(element, 'click', function() {
                    //对外面传进来的arguments函数数组进行循环绑定
                    args[count++ % args.length].call(this);
                });
            })(this.elements[i], arguments);
        }
        return this;
    };

    /**
     * 设置显示
     * @return {[ZXC]} [ZXC对象]
     */
    ZXC.prototype.show = function() {
        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].style.display = 'block';
        }
        return this;
    };

    /**
     * 设置隐藏
     * @return {[ZXC]} [ZXC对象]
     */
    ZXC.prototype.hide = function() {
        for (var i = 0; i < this.elements.length; i++) {
            this.elements[i].style.display = 'none';
        }
        return this;
    };

    /**
     * 设置物体居中,需要先设置position
     * @param  {[Number]} width  [宽度]
     * @param  {[Number]} height [高度]
     * @return {[ZXC]}           [ZXC对象]
     */
    ZXC.prototype.center = function(width, height) {
        //bug修复，物体居中位置需要加上滚动的距离
        var top = (ZXC.tool.getInner().height - height) / 2 + ZXC.tool.getScroll().top;
        var left = (ZXC.tool.getInner().width - width) / 2 + ZXC.tool.getScroll().left;
        for (var i = 0, len = this.elements.length; i < len; i++) {
            this.elements[i].style.top = top + 'px';
            this.elements[i].style.left = left + 'px';
        }
        return this;
    };

    /**
     * 锁屏功能
     * @return {[ZXC]} [ZXC对象]
     */
    ZXC.prototype.lock = function() {
        for (var i = 0, len = this.elements.length; i < len; i++) {
            //当拖动文字拉下去时候让页面重新回到原来位置
            //这里用ZXC.tool.fixedScroll函数的top和left属性记录当前滚动高度的值，如果页面滚动则让页面返回原来位置
            var scrollLeft = ZXC.tool.getScroll().left,
                scrollTop = ZXC.tool.getScroll().top;
            ZXC.tool.fixedScroll.top = scrollTop;
            ZXC.tool.fixedScroll.left = scrollLeft;
            //bug修复，锁屏的画布长度和高度为视口长度和宽度加上滚动的长度
            this.elements[i].style.width = ZXC.tool.getInner().width + ZXC.tool.getScroll().left + 'px';
            this.elements[i].style.height = ZXC.tool.getInner().height + ZXC.tool.getScroll().top + 'px';
            this.elements[i].style.display = 'block';

            //隐藏滚动条
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            //阻止事件的默认行为(包括拖拽文本，滚动条等)
            ZXC.tool.addEvent(this.elements[i], 'mousedown', ZXC.tool.predef);
            ZXC.tool.addEvent(this.elements[i], 'mouseup', ZXC.tool.predef);
            //IE阻止事件的默认行为(包括拖拽文本，滚动条等)
            ZXC.tool.addEvent(this.elements[i], 'selectstart', ZXC.tool.predef);
            //锁屏时候不让页面滚动
            ZXC.tool.addEvent(window, 'scroll', ZXC.tool.fixedScroll);
        }
        return this;
    };

    /**
     * 解锁屏功能
     * @return {[ZXC]} [ZXC对象]
     */
    ZXC.prototype.unlock = function() {
        for (var i = 0, len = this.elements.length; i < len; i++) {
            this.elements[i].style.display = 'none';
            //显示滚动条
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
            //阻止事件的默认行为(包括拖拽文本，滚动条等)
            ZXC.tool.removeEvent(this.elements[i], 'mousedown', ZXC.tool.predef);
            ZXC.tool.removeEvent(this.elements[i], 'mouseup', ZXC.tool.predef);
            //IE阻止事件的默认行为(包括拖拽文本，滚动条等)
            ZXC.tool.removeEvent(this.elements[i], 'selectstart', ZXC.tool.predef);
            //移除lock时候的事件，防止unlock的时候页面又不能拖动
            ZXC.tool.removeEvent(window, 'scroll', ZXC.tool.fixedScroll);
        }
        return this;
    };

    /**
     * 触发点击事件
     * @param  {Function} fn [回调函数]
     * @return {[ZXC]}       [ZXC对象]
     */
    ZXC.prototype.click = function(fn) {
        for (var i = 0, len = this.elements.length; i < len; i++) {
            this.elements[i].onclick = fn;
        }
        return this;
    };

    /**
     * 触发浏览器窗口事件
     * @param  {Function} fn [回调函数]
     * @return {[ZXC]}       [ZXC对象]
     */
    ZXC.prototype.resize = function(fn) {
        for (var i = 0, len = this.elements.length; i < len; i++) {
            var element = this.elements[i];
            ZXC.tool.addEvent(window, 'resize', function() {
                fn();
                //IE的滚动条出现和消失会触发resize事件
                //防止元素在页面拉伸的时候超出屏幕范围
                if (element.offsetLeft > ZXC.tool.getInner().width + ZXC.tool.getScroll().left - element.offsetWidth) {
                    element.style.left = ZXC.tool.getInner().width + ZXC.tool.getScroll().left - element.offsetWidth + 'px';
                    if (element.offsetLeft <= 0 + ZXC.tool.getScroll().left) {
                        element.style.left = 0 + ZXC.tool.getScroll().left + 'px';
                    }
                }
                if (element.offsetTop > ZXC.tool.getInner().height + ZXC.tool.getScroll().top - element.offsetHeight) {
                    element.style.top = ZXC.tool.getInner().height + ZXC.tool.getScroll().top - element.offsetHeight + 'px';
                    if (element.offsetTop <= 0 + ZXC.tool.getScroll().top) {
                        element.style.top = 0 + ZXC.tool.getScroll().top + 'px';
                    }
                }
            });
        }
        return this;
    };

    /*
     * 设置动画
     * 支持上下左右位移，高度宽度变换，透明度渐变
     * obj = {
                attr,   属性
                start,  起始值
                target, 目标值
                alter,  增量
                t,      频率
                step    步长
                speed,  速率
                type，   运动类型
                mul,    多属性动画
             }
     */
    ZXC.prototype.animate = function(obj) {
        for (var i = 0, len = this.elements.length; i < len; i++) {
            //---------------------------------------------------------------------------------------
            //获取参数
            var element = this.elements[i],
                //attr属性，可以传值也可以用定义的属性
                //可选 x：left/y:top
                //可选 w:width/h:height
                //可选 o:opacity
                //默认 x:left
                attr = obj['attr'] == 'x' ? 'left' :
                obj['attr'] == 'y' ? 'top' :
                obj['attr'] == 'w' ? 'width' :
                obj['attr'] == 'h' ? 'height' :
                obj['attr'] == 'o' ? 'opacity' :
                obj['attr'] ? obj['attr'] : 'left',

                //当start属性不存在且attr为o:opacity的时候则为透明度变换
                //当start属性不存在的时候为其他属性变换
                start = obj['start'] ? obj['start'] :
                attr == 'opacity' ? parseFloat(ZXC.tool.getStyle(element, attr)) * 100 :
                parseInt(ZXC.tool.getStyle(element, attr)),

                //可选，默认10毫秒执行一次
                t = obj['t'] ? obj['t'] : 10,
                //可选，每次运行10像素
                step = obj['step'] ? obj['step'] : 20,
                //可选，动画单位时间增量
                alter = obj['alter'],
                //可选，取得目标值
                target = obj['target'],
                //可选，多属性动画
                mul = obj['mul'],
                //可选，默认缓冲速度为6
                speed = obj['speed'] ? obj['speed'] : 6,
                //可选，运动类型0表示匀速，1表示缓冲，默认缓冲运动
                type = obj['type'] == 0 ? 'constant' :
                obj['type'] == 1 ? 'buffer' : 'buffer';
            //---------------------------------------------------------------------------------------
            //当只有增量而没有目标量的时候取递增量，当两个都没有的时候报错
            if (alter && !target == undefined) {
                target = alter + start;
            } else if (alter == undefined && target == undefined && mul == undefined) {
                throw new Error('animate():alter增量或target目标量必须传一个');
            }

            if (start > target) step = -step;

            //当传入的为透明度变化的时候，设置元素初始的透明度
            if (attr == 'opacity') {
                element.style.opacity = parseInt(start) / 100;
                element.style.filter = 'alpha(opacity=' + parseInt(start) + ')';
            } else {
                //element.style[attr] = start + 'px';
            }

            if (mul == undefined) {
                mul = {};
                mul[attr] = target;
            }


            clearInterval(element.timer);
            element.timer = setInterval(function() {

                //创建一个布尔值，这个值可以了解多个动画是否全部执行完毕
                var flag = true; //表示都执行完毕了

                //多属性动画的x:left,y:top,w:width,h:height,o:opacity属性
                for (var i in mul) {
                    attr = i == 'x' ? 'left' :
                        i == 'y' ? 'top' :
                        i == 'w' ? 'width' :
                        i == 'h' ? 'height' :
                        i == 'o' ? 'opacity' :
                        i ? i : 'left';
                    //多属性动画的单个属性变换
                    target = mul[i];

                    //对step根据是否为缓冲和透明度变化取值
                    //当为缓冲运动的时候，对透明度取step增量
                    if (type == 'buffer') {
                        step = attr == 'opacity' ? (target - parseFloat(ZXC.tool.getStyle(element, attr)) * 100) / speed :
                            (target - parseInt(ZXC.tool.getStyle(element, attr))) / speed;
                        step = step > 0 ? Math.ceil(step) : Math.floor(step);
                    }
                    //当为透明度变化的时候
                    if (attr == 'opacity') {
                        if (step == 0) {
                            setOpacity();
                        } else if (step > 0 && Math.abs(parseFloat(ZXC.tool.getStyle(element, attr)) * 100 - target) <= step) {
                            setOpacity();
                        } else if (step < 0 && (parseFloat(ZXC.tool.getStyle(element, attr)) * 100 - target) <= Math.abs(step)) {
                            setOpacity();
                        } else {
                            var temp = parseFloat(ZXC.tool.getStyle(element, attr)) * 100;
                            element.style.opacity = parseInt(temp + step) / 100;
                            element.style.filter = 'alpha(opacity=' + parseInt(temp + step) + ')';
                        }

                        if (parseInt(target) != parseInt(parseFloat(ZXC.tool.getStyle(element, attr)) * 100)) flag = false;

                    } else {
                        if (step == 0) {
                            setTarget();
                        } else if (step > 0 && Math.abs(parseInt(ZXC.tool.getStyle(element, attr)) - target) <= step) {
                            setTarget();
                        } else if (step < 0 && (parseInt(ZXC.tool.getStyle(element, attr)) - target) <= Math.abs(step)) {
                            setTarget();
                        } else {
                            element.style[attr] = parseInt(ZXC.tool.getStyle(element, attr)) + step + 'px';
                        }

                        if (parseInt(target) != parseInt(ZXC.tool.getStyle(element, attr))) flag = false;
                    }

                }

                if (flag) {
                    clearInterval(element.timer);
                    if (obj.fn) obj.fn();
                }

            }, t);

            //设置元素目标位置
            function setTarget() {
                element.style[attr] = target + 'px';
            }
            //设置透明度，设置元素终止状态的标准属性和IE属性的透明度
            function setOpacity() {
                element.style.opacity = parseInt(target) / 100;
                element.style.filter = 'alpha(opacity=' + parseInt(target) + ')';
            }
        }
        return this;
    };

    /**
     * 插件接口
     * @param  {[String]}   name [在原型上扩展属性]
     * @param  {Function}   fn   [绑定的函数]
     */
    ZXC.prototype.extend = function(name, fn) {
        ZXC.prototype[name] = fn;
    };

    window.$ = $;
    window.ZXC = ZXC;
})(window);

/*
 * @title		拖动插件，调用基础库的extend进行扩展
 * @description 传入基本对象，对基本对象进行拖动扩展
 * @param 		基本对象数组
 * @return 		基本对象数组
 */
$().extend('drag', function() {
    //获取基本对象数组
    var tags = arguments;

    //循环数组添加拖拽事件
    for (var i = 0, len = this.elements.length; i < len; i++) {

        //调用基础库的addEvent跨浏览器添加mousedown事件
        addEvent(this.elements[i], 'mousedown', function(e) {

            //修复没有html元素时候的拖拽
            if (trim(this.innerHTML).length == 0) {
                e.preventDefault();
            }

            //缓存this对象，下面的闭包会用到
            var _this = this;

            //获取鼠标点击到对象左、上边界的距离
            var diffX = e.clientX - _this.offsetLeft;
            var diffY = e.clientY - _this.offsetTop;

            //自定义拖拽区域
            var flag = false;

            for (var i = 0; i < tags.length; i++) {
                if (e.target == tags[i]) {
                    flag = true; //只要有一个是true，就立刻返回
                    break;
                }
            }

            //点击的对象是传递进来的数组的时候，启用拖拽
            if (flag) {
                addEvent(document, 'mousemove', move);
                addEvent(document, 'mouseup', up);
            } else {
                removeEvent(document, 'mousemove', move);
                removeEvent(document, 'mouseup', up);
            }

            //拖拽移动时候触发的事件
            function move(e) {
                //获取元素相对于视口上下边界的距离
                var left = e.clientX - diffX;
                var top = e.clientY - diffY;

                //禁止元素拖拽出视口
                if (left < 0) {
                    left = 0;
                } else if (left <= getScroll().left) {
                    left = getScroll().left;
                } else if (left > getInner().width + getScroll().left - _this.offsetWidth) {
                    left = getInner().width + getScroll().left - _this.offsetWidth;
                }

                if (top < 0) {
                    top = 0;
                } else if (top <= getScroll().top) {
                    top = getScroll().top;
                } else if (top > getInner().height + getScroll().top - _this.offsetHeight) {
                    top = getInner().height + getScroll().top - _this.offsetHeight;
                }

                _this.style.left = left + 'px';
                _this.style.top = top + 'px';

                //修复IE鼠标可以向下拖动的bug
                if (typeof _this.setCapture != 'undefined') {
                    _this.setCapture();
                }
            }

            //释放鼠标的时候移除拖拽事件
            function up() {
                removeEvent(document, 'mousemove', move);
                removeEvent(document, 'mouseup', up);
                //修复IE鼠标可以向下拖动的bug
                if (typeof _this.releaseCapture != 'undefined') {
                    _this.releaseCapture();
                }
            }
        });
    }
    //返回对象数组，维持连缀写法
    return this;
});

$().extend('serialize', function() {
    for (var i = 0, len = this.elements.length; i < len; i++) {
        var form = this.elements[i];
        var parts = {};
        for (var i = 0, flen = form.elements.length; i < flen; i++) {
            var filed = form.elements[i];
            //匹配类型，没用的全部跳过
            switch (filed.type) {
                case undefined:
                case 'submit':
                case 'reset':
                case 'file':
                case 'button':
                    break;
                case 'radio':
                case 'checkbox':
                    if (!filed.selected) break;
                case 'select-one':
                case 'select-multiple':
                    for (var j = 0; j < filed.options.length; j++) {
                        var option = filed.options[j];
                        //获取option的值
                        if (option.selected) {
                            var optValue = '';
                            //W3C支持hasAttribute属性，如果有则用value没有则用option里面的文本
                            if (option.hasAttribute) {
                                optValue = (option.hasAttribute('value') ? option.value :
                                    option.text);
                            } else { //IE
                                optValue = (option.attributes('value').specified ? option.value :
                                    option.text);
                            }
                            parts[filed.name] = optValue;
                        }
                    }
                    break;
                default:
                    parts[filed.name] = filed.value;
            }
        }
        return parts;
    }
    return this;
});
