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
