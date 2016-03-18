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
