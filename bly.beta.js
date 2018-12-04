"use strict"
console.log('bly.js v0.1测试版本');
//
// 支持功能：
// 			文本单项绑定   文本框双向绑定	支持methods  支持compute
// 	匹配标签
var lableExp = /(\<\/?)([a-z]+?)(\b.*?)(\>)/;
//	匹配标签左边的文本
var leftTextExp = /([.\w\W-\>\:\<]+?)(\<\/?[a-z]+?\b.*?\>)/;
//	匹配属性
var attrExp = /(.+?)\=[\'\"](.+?)[\'\"]/g;
//	匹配潜入变量
// var embedVarExp=/\_\>\:(.+?)\:\<\_/
var embedVarExp = RegExp('{{(.+?)}}', 'ig');
//	匹配注释
var notesExp = RegExp('<!--(.*)-->', 'ig');
//	单标签
var singleTable = ['br', 'hr', 'img', 'input', 'param', 'meta', 'link'];
//	全局临时状态  Global temporary state
var GTS = null

function update(arr, val) {
	if (!(arr) || arr.length <= 0) return;
	if (typeof(val) == 'object') {
		val = val.value;
	}
	// console.log(arr);
	arr.forEach(function(node) {
		node.nodeType == 3 ? node.nodeValue = val : node.value = val;
	})
}

function bind(node, obj) {
	// console.log('bind',node,obj);
	// if(obj.bind[node]){return;}
	if (typeof(obj) == 'object') {
		obj.bind.push(node);
	} else {
		//重新设置了 所有
		obj = {
			bind: [],
			value: obj
		};
		obj.bind.push(node);
	}
	return obj;
}
class Bly {
	constructor(options) {
		this.root = document.getElementById(options.el);
		var _data = options.data;
		this.methods = options.methods;
		this.compute = options.compute;
		this.data = this.PROXY(_data);
		var _dom = this._compile(this.root.innerHTML, this);
		var dom = this.render(_dom);
		this.root.innerHTML = '';
		// console.dir(this.root);
		this.root.appendChild(dom);
	}
	_compile(rootString) {
		var container = {
			childs: []
		};
		// console.time('seek TIME');
		// 删除注释
		rootString = rootString.replace(notesExp, '');
		this.seek(rootString, container);
		// console.timeEnd('seek TIME');
		return container;
	}
	seek(str, container) {
		var match = null;
		if (leftTextExp.test(str)) {
			str = str.replace(leftTextExp, function() {
				match = arguments;
				if (match[1].replace(/\s/g, '').length > 0) {
					container.childs.push(match[1])
				}
				return match[2];
			})
		}
		if (lableExp.test(str)) {
			str = str.replace(lableExp, function() {
				match = arguments;
				return '';
			})
			if (!match) return;
			if (match[1] == '<') {
				var obj = h(match[2], [], []);
				//添加属性
				if (attrExp.test(match[3])) {
					match[3].replace(attrExp, function() {
						var a1 = arguments[1].trim();
						var a2 = arguments[2].trim();
						obj.props[a1] = a2;
					})
				}
				container.childs.push(obj);
				//但标签跳过
				for (var key in singleTable) {
					if (match[2] == singleTable[key]) {
						GTS = 1;
						break;
					} else {
						GTS = 0;
					}
				}
				if (GTS == 0) {
					str = this.seek(str, obj);
				}
				str = this.seek(str, container); //找兄
				GTS = null;
			}
		}
		return str;
	}
	render(dom) {
		if (!dom) return;
		var _this = this;
		var node = document.createDocumentFragment();
		// console.log(node);
		Object.keys(dom).forEach(function(ite) {
			switch (ite) {
			case 'name':
				node = document.createElement(dom[ite]);
				break;
			case 'props':
				for (var key in dom[ite]) {
					node.setAttribute(key, dom[ite][key]);
				}
				var attributeValue = node.getAttribute('tie');
				if (node.hasAttribute(("tie")) && node.tagName.toLocaleUpperCase() == "INPUT" || node.tagName.toLocaleUpperCase() == "TEXTAREA") {
					node.addEventListener("input", function() {
						var evalExp = '_this.data.m=node.value';
						evalExp = evalExp.replace(/m/ig, attributeValue);
						eval(evalExp);
					})
					var evalExp = '_this.data.m=bind(node,_this.data.m)';
					evalExp = evalExp.replace(/m/ig, attributeValue);
					eval(evalExp);
				}
				break;
			case 'childs':
				dom[ite].forEach(function(item, index) {
					if (isString(item)) {
						var matches = item.match(embedVarExp);
						var splitTextNodes = item.split(/\{\{.+?\}\}/);
						if (matches) {
							var newMatches = matches.map(function(item) {
								return item.replace(/\{\{(.+?)\}\}/, '$1');
							})
							if (splitTextNodes[0]) {
								node.appendChild(document.createTextNode(splitTextNodes[0]));
							}
							for (var ii = 0; ii < newMatches.length; ii++) {
								var m = newMatches[ii];
								var el = document.createTextNode('');
								node.appendChild(el);
								if (splitTextNodes[ii + 1]) {
									node.appendChild(document.createTextNode(splitTextNodes[ii + 1]));
								}
								var evalExp = '_this.data.m=bind(el,_this.data.m)';
								evalExp = evalExp.replace(/m/ig, m);
								eval(evalExp);
							}
						} else {
							node.appendChild(document.createTextNode(item));
						}
					} else {
						node.appendChild(_this.render(item));
					}
				})
				break;
			}
		})
		return node;
	}
	PROXY(data) {
		var p = new Proxy(data, handler);
		for (var i in data) {
			var obj = data[i];
			if (isObject(obj) || isArray(obj)) {
				p[i] = this.PROXY(obj);
			}
		}
		return p;
	}
}
var handler = {
	get: function(target, prop) {
		return Reflect.get(target, prop);
	},
	set: function(target, prop, newVal, receiver) {
		if (typeof(newVal) == 'object' || !(target[prop].hasOwnProperty('value'))) {
			Reflect.set(target, prop, newVal);
		} else {
			Reflect.set(target[prop], 'value', newVal);
		}
		update(target[prop].bind, newVal);
		return true;
	}
}