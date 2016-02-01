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
// var header = document.getElementById('header')
// function bb() {
//     alert('1');
// }
// EventUtil.addHandler(window,'load',function(){
//     alert('1');
// });
// EventUtil.addHandler(window,'load',function(){
//     alert('2');
// });EventUtil.addHandler(window,'load',function(){
//     alert('3');
// });
// EventUtil.addHandler(header,'click',function(){
//     alert("111");
// });

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
addEvent(window,'load',bb2);
addEvent(window,'load',bb3);