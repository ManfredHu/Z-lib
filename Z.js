var $ = function(args) {
    return new ZXC(args);
};
//基础库ZXC构造函数
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
//ready接口，页面加载完成时调用fn函数
ZXC.prototype.ready = function(fn) {
    domReady(fn);
};
//获取ID节点
ZXC.prototype.getId = function(id) {
    return document.getElementById(id);
};
//获取元素节点数组
ZXC.prototype.getTagName = function(tag, parentNode) {
    var node = parentNode || document;
    var temps = [];
    var tags = node.getElementsByTagName(tag);
    for (var i = 0, len = tags.length; i < len; i++) {
        temps.push(tags[i]);
    }
    return temps;
};

//获取CLASS节点数组
ZXC.prototype.getClass = function(className, parentNode) {
        var node = null;
        var temps = [];
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
        return temps;
    }
    //---------------------------------------------------------------------------------
    //设置CSS选择器子节点
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
    }
    //---------------------------------------------------------------------------------
    //获取某一个节点，并返回这个节点对象(注意只有一个元素)
ZXC.prototype.ge = function(num) {
    return this.elements[num];
};
//---------------------------------------------------------------------------------
//获取首个节点，并返回这个节点对象(注意只有一个元素)
ZXC.prototype.first = function() {
    return this.elements[0];
};
//---------------------------------------------------------------------------------
//获取末个节点，并返回这个节点对象(注意只有一个元素)
ZXC.prototype.last = function() {
    return this.elements[this.elements.length - 1];
};
//---------------------------------------------------------------------------------
//获取某组节点的数量
ZXC.prototype.length = function() {
    return this.elements.length;
};
//---------------------------------------------------------------------------------
//获取某一个节点的属性
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
//---------------------------------------------------------------------------------
//获取某一个节点在整个节点组中是第几个索引
ZXC.prototype.index = function() {
    var children = this.elements[0].parentNode.children;
    for (var i = 0; i < children.length; i++) {
        if (this.elements[0] == children[i]) return i;
    }
};
//---------------------------------------------------------------------------------
//设置某一个节点的透明度
ZXC.prototype.opacity = function(num) {
    for (var i = 0; i < this.elements.length; i++) {
        this.elements[i].style.opacity = num / 100;
        this.elements[i].style.filter = 'alpha(opacity=' + num + ')';
    }
    return this;
};
//---------------------------------------------------------------------------------
//获取某一个节点，并且ZXC对象
ZXC.prototype.eq = function(num) {
    var element = this.elements[num];
    this.elements = [];
    this.elements[0] = element;
    return this;
};
//---------------------------------------------------------------------------------
//获取当前节点的下一个元素节点
ZXC.prototype.next = function() {
    for (var i = 0; i < this.elements.length; i++) {
        this.elements[i] = this.elements[i].nextSibling;
        if (this.elements[i] == null) throw new Error('next():找不到下一个同级元素节点！'); //IEbug
        if (this.elements[i].nodeType == 3) this.next();
    }
    return this;
};
//---------------------------------------------------------------------------------
//获取当前节点的上一个元素节点
ZXC.prototype.prev = function() {
    for (var i = 0; i < this.elements.length; i++) {
        this.elements[i] = this.elements[i].previousSibling;
        if (this.elements[i] == null) throw new Error('prev():找不到上一个同级元素节点！'); //IEbug
        if (this.elements[i].nodeType == 3) this.prev();
    }
    return this;
};
//设置CSS
ZXC.prototype.css = function(attr, value) {
    for (var i = 0; i < this.elements.length; i++) {
        if (arguments.length == 1) {
            return getStyle(this.elements[i], attr);
        }
        this.elements[i].style[attr] = value;
    }
    return this;
};

//添加Class
ZXC.prototype.addClass = function(className) {
    for (var i = 0; i < this.elements.length; i++) {
        if (!hasClass(this.elements[i], className)) {
            this.elements[i].className += ' ' + className;
        }
    }
    return this;
};
//移除Class
ZXC.prototype.removeClass = function(className) {
    for (var i = 0; i < this.elements.length; i++) {
        if (hasClass(this.elements[i], className)) {
            this.elements[i].className = this.elements[i].className.replace(new RegExp('(\\s|^)' + className + '(\\s|$)'), ' ');
        }
    }
    return this;
};
//---------------------------------------------------------------------------------
//添加link或style的CSS规则
ZXC.prototype.addRule = function(num, selectorText, cssText, position) {
    var sheet = document.styleSheets[num];
    insertRule(sheet, selectorText, cssText, position);
    return this;
};
//---------------------------------------------------------------------------------
//移除link或style的CSS规则
ZXC.prototype.removeRule = function(num, index) {
    var sheet = document.styleSheets[num];
    deleteRule(sheet, index);
    return this;
};
//---------------------------------------------------------------------------------
//设置表单字段元素
ZXC.prototype.form = function(name) {
    for (var i = 0; i < this.elements.length; i++) {
        this.elements[i] = this.elements[i][name];
    }
    return this;
};
//---------------------------------------------------------------------------------
//设置表单字段内容获取
ZXC.prototype.value = function(str) {
    for (var i = 0; i < this.elements.length; i++) {
        if (arguments.length == 0) {
            return this.elements[i].value;
        }
        this.elements[i].value = str;
    }
    return this;
};
//---------------------------------------------------------------------------------
//设置innerHTML
ZXC.prototype.html = function(str) {
    for (var i = 0; i < this.elements.length; i++) {
        if (arguments.length == 0) {
            return this.elements[i].innerHTML;
        }
        this.elements[i].innerHTML = str;
    }
    return this;
};
//---------------------------------------------------------------------------------
//设置innerText
ZXC.prototype.text = function(str) {
    for (var i = 0; i < this.elements.length; i++) {
        if (arguments.length == 0) {
            return getInnerText(this.elements[i]);
        }
        setInnerText(this.elements[i], text);
    }
    return this;
};
//---------------------------------------------------------------------------------
//设置事件发生器
ZXC.prototype.bind = function(event, fn) {
    for (var i = 0; i < this.elements.length; i++) {
        addEvent(this.elements[i], event, fn);
    }
    return this;
};
//---------------------------------------------------------------------------------
//设置鼠标移入移出方法
ZXC.prototype.hover = function(over, out) {
    for (var i = 0; i < this.elements.length; i++) {
        addEvent(this.elements[i], 'mouseover', over);
        addEvent(this.elements[i], 'mouseout', out);
    }
    return this;
};
//---------------------------------------------------------------------------------
//设置点击切换方法
ZXC.prototype.toggle = function() {
    //用arguments函数数组对this.element数组元素进行多重绑定
    for (var i = 0; i < this.elements.length; i++) {
        //立即绑定事件
        (function(element, args) {
            var count = 0;
            addEvent(element, 'click', function() {
                //对外面传进来的arguments函数数组进行循环绑定
                args[count++ % args.length].call(this);
            });
        })(this.elements[i], arguments);
    }
    return this;
};
//---------------------------------------------------------------------------------
//设置显示
ZXC.prototype.show = function() {
    for (var i = 0; i < this.elements.length; i++) {
        this.elements[i].style.display = 'block';
    }
    return this;
};
//---------------------------------------------------------------------------------
//设置隐藏
ZXC.prototype.hide = function() {
    for (var i = 0; i < this.elements.length; i++) {
        this.elements[i].style.display = 'none';
    }
    return this;
};
//---------------------------------------------------------------------------------
//设置物体居中
ZXC.prototype.center = function(width, height) {
    //bug修复，物体居中位置需要加上滚动的距离
    var top = (getInner().height - height) / 2 + getScroll().top;
    var left = (getInner().width - width) / 2 + getScroll().left;
    for (var i = 0; i < this.elements.length; i++) {
        this.elements[i].style.top = top + 'px';
        this.elements[i].style.left = left + 'px';
    }
    return this;
};
//---------------------------------------------------------------------------------
//锁屏功能
ZXC.prototype.lock = function() {
    for (var i = 0; i < this.elements.length; i++) {
        //bug修复，当拖动文字拉下去时候让页面重新回到原来位置
        //这里用fixedScroll函数的top和left属性记录当前滚动高度的值，如果页面滚动则让页面返回原来位置
        fixedScroll.top = getScroll().top;
        fixedScroll.left = getScroll().left;
        //bug修复，锁屏的画布长度和高度为视口长度和宽度加上滚动的长度
        this.elements[i].style.width = getInner().width + getScroll().left + 'px';
        this.elements[i].style.height = getInner().height + getScroll().top + 'px';
        this.elements[i].style.display = 'block';
        //新旧firefox对滚动条overflow:hidden的支持不一样
        parseFloat(sys.firefox) < 4 ? document.body.style.overflow = 'hidden' :
            document.documentElement.style.overflow = 'hidden';
        //阻止事件的默认行为(包括拖拽文本，滚动条等)
        addEvent(this.elements[i], 'mousedown', predef);
        addEvent(this.elements[i], 'mouseup', predef);
        //IE阻止事件的默认行为(包括拖拽文本，滚动条等)
        addEvent(this.elements[i], 'selectstart', predef);
        //锁屏时候不让页面滚动
        addEvent(window, 'scroll', fixedScroll);
    }
    return this;
};
//---------------------------------------------------------------------------------
//解锁屏功能
ZXC.prototype.unlock = function() {
    for (var i = 0; i < this.elements.length; i++) {
        this.elements[i].style.display = 'none';
        //新旧firefox对滚动条overflow:hidden的支持不一样
        parseFloat(sys.firefox) < 4 ? document.body.style.overflow = 'auto' :
            document.documentElement.style.overflow = 'auto';
        //阻止事件的默认行为(包括拖拽文本，滚动条等)
        removeEvent(this.elements[i], 'mousedown', predef);
        removeEvent(this.elements[i], 'mouseup', predef);
        //IE阻止事件的默认行为(包括拖拽文本，滚动条等)
        removeEvent(this.elements[i], 'selectstart', predef);
        //移除lock时候的事件，防止unlock的时候页面又不能拖动
        removeEvent(window, 'scroll', fixedScroll);
    }
    return this;
};
//---------------------------------------------------------------------------------
//触发点击事件
ZXC.prototype.click = function(fn) {
    for (var i = 0; i < this.elements.length; i++) {
        this.elements[i].onclick = fn;
    }
    return this;
};
//---------------------------------------------------------------------------------
//触发浏览器窗口事件
ZXC.prototype.resize = function(fn) {
    for (var i = 0; i < this.elements.length; i++) {
        var element = this.elements[i];
        addEvent(window, 'resize', function() {
            fn();
            //IE的滚动条出现和消失会触发resize事件
            if (element.offsetLeft > getInner().width + getScroll().left - element.offsetWidth) {
                element.style.left = getInner().width + getScroll().left - element.offsetWidth + 'px';
                if (element.offsetLeft <= 0 + getScroll().left) {
                    element.style.left = 0 + getScroll().left + 'px';
                }
            }
            if (element.offsetTop > getInner().height + getScroll().top - element.offsetHeight) {
                element.style.top = getInner().height + getScroll().top - element.offsetHeight + 'px';
                if (element.offsetTop <= 0 + getScroll().top) {
                    element.style.top = 0 + getScroll().top + 'px';
                }
            }
        });
    }
    return this;
};
//---------------------------------------------------------------------------------
/*
 * 设置动画
 * 支持上下左右位移，高度宽度变换，透明度渐变
 * obj = {
 			attr,	属性
 		  	start,	起始值
 		  	target, 目标值
 		  	alter,	增量
 		  	t,		频率
 		  	step 	步长
			speed,	速率
			type，	运动类型
			mul,	多属性动画
 		 }
 */
ZXC.prototype.animate = function(obj) {
    for (var i = 0; i < this.elements.length; i++) {
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
            attr == 'opacity' ? parseFloat(getStyle(element, attr)) * 100 :
            parseInt(getStyle(element, attr)),

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
                    step = attr == 'opacity' ? (target - parseFloat(getStyle(element, attr)) * 100) / speed :
                        (target - parseInt(getStyle(element, attr))) / speed;
                    step = step > 0 ? Math.ceil(step) : Math.floor(step);
                }
                //当为透明度变化的时候
                if (attr == 'opacity') {
                    if (step == 0) {
                        setOpacity();
                    } else if (step > 0 && Math.abs(parseFloat(getStyle(element, attr)) * 100 - target) <= step) {
                        setOpacity();
                    } else if (step < 0 && (parseFloat(getStyle(element, attr)) * 100 - target) <= Math.abs(step)) {
                        setOpacity();
                    } else {
                        var temp = parseFloat(getStyle(element, attr)) * 100;
                        element.style.opacity = parseInt(temp + step) / 100;
                        element.style.filter = 'alpha(opacity=' + parseInt(temp + step) + ')';
                    }

                    if (parseInt(target) != parseInt(parseFloat(getStyle(element, attr)) * 100)) flag = false;

                } else {
                    if (step == 0) {
                        setTarget();
                    } else if (step > 0 && Math.abs(parseInt(getStyle(element, attr)) - target) <= step) {
                        setTarget();
                    } else if (step < 0 && (parseInt(getStyle(element, attr)) - target) <= Math.abs(step)) {
                        setTarget();
                    } else {
                        element.style[attr] = parseInt(getStyle(element, attr)) + step + 'px';
                    }

                    if (parseInt(target) != parseInt(getStyle(element, attr))) flag = false;
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
//---------------------------------------------------------------------------------
//插件接口
ZXC.prototype.extend = function(name, fn) {
    ZXC.prototype[name] = fn;
};
