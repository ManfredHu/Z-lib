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
