// console.log($('#header'));
// console.log($('.red'));
// var a = new ZXC();
// console.log(a.getId('header'))
// console.log(a.getTagName('p',a.getId('header')))
// 
// var b = document.querySelector('#header')
// b.querySelector('p');
// 
// console.log($(function() {
//    alert('测试'); 
// }))

// console.log($(function() {
//    alert('测试2'); 
// }))
var header = document.getElementById('header')
EventUtil.addHandler(header,'click',function(){
    alert(this);
});