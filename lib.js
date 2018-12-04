
//判断表达式
function isExpress(str)
{
	return /\-\>(.*?)\<\-/.test(str)?true:false;
}

//判断变量
function isVar(str)
{
	return /\-(.*?)\-/.test(str)?true:false;
}

//判断字符串
function isString(str)
{
	return typeof(str)=='string'?true:false;
}

//处理字符
function Tstring(str)
{
	return "'"+str+"'";
}

//判断数字
function isNumber(num)
{
	return typeof(num)=='number'?true:false;
}

//判断数组
function isArray(arr)
{
	return Array.isArray(arr)?true:false;
}
//判断数组操作
function isPropArr(prop)
{
	var arr=['push','splice','slice'];
	return arr[prop]?true:false;
}
//判断对象
function isObject(obj)
{
	return typeof(obj)=='object'?true:false;
}

//创建文本节点
function createTextNode(txt)
{
	return document.createTextNode(txt);
}
//创建元素节点
function createElement(txt)
{
	return document.createElement(txt);
}

function runFunction(fun)
{
	return fun();
}

function selector(name)
	{
		var elem=null;
		if(name[0]=='#'){elem=document.getElementById(name.slice(1,name.length));}
		else if(name[0]=='.'){elem=document.getElementsByClassName(name.slice(1,name.length));}
		else{
			elem=document.getElementsByTagName(name);
		}
		if(elem){
			//为解决技术问题  三目运算符 分号后面必须要写程序
			return elem.length==0?null:elem.length==1?elem[0]:elem;
		}else{return null;}
		
	};


function h(name,props,childs)
{
	return {name,props,childs}
}
