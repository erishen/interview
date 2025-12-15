# 前端工程师面试知识大全（深度扩展版）

> 目标：**从基础到进阶，全面覆盖前端面试高频考点**，适合系统复习和查漏补缺

---

## 一、JavaScript 基础（核心地基）

### 1️⃣ 语言特性

* **解释型语言**（JIT 即时编译）
* **单线程**（通过 Event Loop 实现并发）
* **动态类型语言**（运行时确定类型）
* **弱类型语言**（类型可以隐式转换）
* **基于原型的面向对象**

---

### 2️⃣ 数据类型（必熟）

#### 基本类型（Primitive）

* **number**（NaN、Infinity、-0、+0）
* **string**（不可变性、模板字符串）
* **boolean**（true/false）
* **undefined**（声明未赋值、void 0）
* **null**（空对象指针、typeof null === 'object'）
* **symbol**（唯一标识、Symbol.for()）
* **bigint**（大整数、n 后缀）

#### 引用类型

* **Object**（普通对象、原型链）
* **Array**（类数组对象、稀疏数组）
* **Function**（一等公民、函数对象）
* **Date**（时间戳、时区）
* **RegExp**（正则表达式、修饰符）
* **Map / Set**（键值对、去重）
* **Error**（错误对象、堆栈信息）

#### 类型判断（面试重点）

```javascript
// typeof - 基础类型判断
typeof 42          // "number"
typeof "hello"     // "string"
typeof true        // "boolean"
typeof undefined   // "undefined"
typeof null        // "object" (历史遗留问题)
typeof {}          // "object"
typeof []          // "object"
typeof function(){} // "function"

// instanceof - 原型链判断
[] instanceof Array        // true
[] instanceof Object       // true

// Object.prototype.toString - 精确判断
Object.prototype.toString.call([])        // "[object Array]"
Object.prototype.toString.call(null)      // "[object Null]"
Object.prototype.toString.call(undefined) // "[object Undefined]"

// 自定义类型判断函数
function getType(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
}
```

#### 类型转换（高频考点）

```javascript
// 隐式转换
"" + 1          // "1"
"" - 1          // -1
[] + {}         // "[object Object]"
{} + []         // 0 (在某些环境下)

// 显式转换
Number("123")   // 123
String(123)     // "123"
Boolean(0)      // false

// 特殊情况
Number("")      // 0
Number(" ")     // 0
Number("123a")  // NaN
parseInt("123a") // 123
```

---

### 3️⃣ 变量 & 作用域（必考）

#### 声明方式对比

| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 是 | 是（但有TDZ） | 是（但有TDZ） |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许 |

#### 暂时性死区（TDZ）

```javascript
console.log(a); // undefined (var 提升)
console.log(b); // ReferenceError (TDZ)

var a = 1;
let b = 2;
```

#### 作用域链

```javascript
var x = 1;
function outer() {
  var x = 2;
  function inner() {
    console.log(x); // 2 (词法作用域)
  }
  return inner;
}
```

---

### 4️⃣ this 指向（必考重点）

#### 绑定规则优先级

1. **new 绑定**（最高优先级）
2. **显式绑定**（call/apply/bind）
3. **隐式绑定**（对象方法调用）
4. **默认绑定**（全局对象或 undefined）

```javascript
// 默认绑定
function foo() {
  console.log(this); // window (非严格模式) 或 undefined (严格模式)
}

// 隐式绑定
const obj = {
  name: 'obj',
  foo() {
    console.log(this.name); // 'obj'
  }
};

// 显式绑定
foo.call(obj);     // this 指向 obj
foo.apply(obj);    // this 指向 obj
foo.bind(obj)();   // this 指向 obj

// new 绑定
function Person(name) {
  this.name = name;
}
const p = new Person('Alice'); // this 指向新创建的对象

// 箭头函数
const arrow = () => {
  console.log(this); // 继承外层作用域的 this
};
```

#### 常见陷阱

```javascript
// 隐式丢失
const obj = {
  name: 'obj',
  foo() {
    console.log(this.name);
  }
};

const fn = obj.foo;
fn(); // undefined (this 指向全局)

// 回调函数中的 this
setTimeout(obj.foo, 1000); // undefined

// 解决方案
setTimeout(() => obj.foo(), 1000); // 'obj'
setTimeout(obj.foo.bind(obj), 1000); // 'obj'
```

---

### 5️⃣ 闭包（核心概念）

#### 定义与形成条件

```javascript
// 闭包：函数 + 函数能够访问的自由变量
function outer(x) {
  // 外部函数的变量
  return function inner(y) {
    return x + y; // 访问外部变量 x
  };
}

const add5 = outer(5);
console.log(add5(3)); // 8
```

#### 常见应用场景

```javascript
// 1. 私有变量
function createCounter() {
  let count = 0;
  return {
    increment() { return ++count; },
    decrement() { return --count; },
    getCount() { return count; }
  };
}

// 2. 函数柯里化
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

// 3. 防抖节流
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, delay) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
```

#### 内存泄漏风险

```javascript
// 潜在内存泄漏
function attachListeners() {
  const largeData = new Array(1000000).fill('data');
  
  document.getElementById('button').addEventListener('click', function() {
    // 闭包持有 largeData 的引用
    console.log('clicked');
  });
}

// 解决方案：及时清理
function attachListeners() {
  const button = document.getElementById('button');
  const handler = function() {
    console.log('clicked');
  };
  
  button.addEventListener('click', handler);
  
  // 清理
  return function cleanup() {
    button.removeEventListener('click', handler);
  };
}
```

---

### 6️⃣ 原型 & 原型链（重点）

#### 核心概念

```javascript
// 构造函数
function Person(name) {
  this.name = name;
}

// 原型对象
Person.prototype.sayHello = function() {
  console.log(`Hello, I'm ${this.name}`);
};

// 实例
const alice = new Person('Alice');

// 原型链关系
alice.__proto__ === Person.prototype;           // true
Person.prototype.__proto__ === Object.prototype; // true
Object.prototype.__proto__ === null;            // true

// instanceof 原理
function myInstanceof(obj, Constructor) {
  let proto = obj.__proto__;
  while (proto) {
    if (proto === Constructor.prototype) {
      return true;
    }
    proto = proto.__proto__;
  }
  return false;
}
```

#### 原型链查找规则

```javascript
const obj = {
  a: 1
};

// 查找顺序：
// 1. obj.a -> 找到，返回 1
// 2. obj.b -> obj.__proto__.b -> Object.prototype.b -> undefined

console.log(obj.a);        // 1
console.log(obj.toString); // [Function: toString] (来自 Object.prototype)
```

#### 继承实现

```javascript
// 1. 原型链继承
function Parent() {
  this.name = 'parent';
}
function Child() {}
Child.prototype = new Parent();

// 2. 构造函数继承
function Child() {
  Parent.call(this);
}

// 3. 组合继承
function Child() {
  Parent.call(this);
}
Child.prototype = new Parent();
Child.prototype.constructor = Child;

// 4. ES6 类继承
class Parent {
  constructor(name) {
    this.name = name;
  }
}
class Child extends Parent {
  constructor(name, age) {
    super(name);
    this.age = age;
  }
}
```

---

### 7️⃣ 异步编程（重点难点）

#### Promise 详解

```javascript
// Promise 三种状态
// pending -> fulfilled
// pending -> rejected

// 基本用法
const promise = new Promise((resolve, reject) => {
  // 异步操作
  setTimeout(() => {
    resolve('success');
    // reject(new Error('failed'));
  }, 1000);
});

promise
  .then(result => console.log(result))
  .catch(error => console.error(error))
  .finally(() => console.log('cleanup'));

// Promise 静态方法
Promise.all([p1, p2, p3])      // 全部成功才成功
Promise.allSettled([p1, p2])   // 等待全部完成
Promise.race([p1, p2])         // 第一个完成的结果
Promise.any([p1, p2])          // 第一个成功的结果
```

#### async/await

```javascript
// async 函数返回 Promise
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// 错误处理
async function handleErrors() {
  try {
    await fetchData();
  } catch (error) {
    // 处理错误
  }
}

// 并发执行
async function concurrent() {
  const [result1, result2] = await Promise.all([
    fetchData1(),
    fetchData2()
  ]);
}
```

#### Event Loop（面试高频）

```javascript
// 宏任务 vs 微任务
console.log('1');

setTimeout(() => console.log('2'), 0);        // 宏任务

Promise.resolve().then(() => console.log('3')); // 微任务

console.log('4');

// 输出顺序：1, 4, 3, 2

// 执行流程：
// 1. 执行同步代码：1, 4
// 2. 执行微任务队列：3
// 3. 执行宏任务队列：2
```

#### 常见异步模式

```javascript
// 1. 回调地狱
getData(function(a) {
  getMoreData(a, function(b) {
    getMoreData(b, function(c) {
      // 嵌套太深
    });
  });
});

// 2. Promise 链
getData()
  .then(a => getMoreData(a))
  .then(b => getMoreData(b))
  .then(c => {
    // 处理结果
  });

// 3. async/await
async function processData() {
  const a = await getData();
  const b = await getMoreData(a);
  const c = await getMoreData(b);
  return c;
}
```

---

### 8️⃣ 常用内置对象（实用技巧）

#### Array 高级方法

```javascript
const arr = [1, 2, 3, 4, 5];

// 转换方法
arr.map(x => x * 2);           // [2, 4, 6, 8, 10]
arr.filter(x => x > 2);        // [3, 4, 5]
arr.reduce((sum, x) => sum + x, 0); // 15

// 查找方法
arr.find(x => x > 2);          // 3
arr.findIndex(x => x > 2);     // 2
arr.includes(3);               // true
arr.indexOf(3);                // 2

// 修改方法
arr.slice(1, 3);               // [2, 3] (不改变原数组)
arr.splice(1, 2, 'a', 'b');    // 删除并插入 (改变原数组)

// 迭代方法
arr.forEach((item, index) => {});
arr.some(x => x > 3);          // true
arr.every(x => x > 0);         // true

// ES6+ 新方法
arr.flat();                    // 扁平化
arr.flatMap(x => [x, x * 2]);  // 映射后扁平化
```

#### Object 操作

```javascript
const obj = { a: 1, b: 2, c: 3 };

// 获取键值
Object.keys(obj);              // ['a', 'b', 'c']
Object.values(obj);            // [1, 2, 3]
Object.entries(obj);           // [['a', 1], ['b', 2], ['c', 3]]

// 属性检查
obj.hasOwnProperty('a');       // true
'a' in obj;                    // true

// 对象合并
Object.assign({}, obj, { d: 4 }); // { a: 1, b: 2, c: 3, d: 4 }
{ ...obj, d: 4 };              // 同上 (ES6)

// 属性描述符
Object.defineProperty(obj, 'x', {
  value: 42,
  writable: false,
  enumerable: true,
  configurable: true
});

// 冻结对象
Object.freeze(obj);            // 不可修改
Object.seal(obj);              // 不可添加/删除属性
Object.preventExtensions(obj); // 不可添加属性
```

#### Map / Set 详解

```javascript
// Map vs Object
const map = new Map();
map.set('key', 'value');
map.set(1, 'number key');
map.set(obj, 'object key');

map.get('key');                // 'value'
map.has('key');                // true
map.delete('key');             // true
map.size;                      // 当前大小

// Set 去重
const set = new Set([1, 2, 2, 3]);
console.log([...set]);         // [1, 2, 3]

set.add(4);
set.has(2);                    // true
set.delete(2);

// WeakMap / WeakSet (弱引用)
const weakMap = new WeakMap();
const key = {};
weakMap.set(key, 'value');
// 当 key 被垃圾回收时，WeakMap 中的条目也会被自动清理
```

---

### 9️⃣ ES6+ 新特性（现代 JS）

#### 解构赋值

```javascript
// 数组解构
const [a, b, ...rest] = [1, 2, 3, 4, 5];
const [x, , z] = [1, 2, 3];   // 跳过元素

// 对象解构
const { name, age, ...others } = person;
const { name: userName } = person; // 重命名

// 默认值
const { x = 10 } = {};
const [y = 20] = [];

// 嵌套解构
const { address: { city } } = person;
```

#### 模板字符串

```javascript
const name = 'World';
const message = `Hello, ${name}!`;

// 多行字符串
const html = `
  <div>
    <h1>${title}</h1>
    <p>${content}</p>
  </div>
`;

// 标签模板
function highlight(strings, ...values) {
  return strings.reduce((result, string, i) => {
    return result + string + (values[i] ? `<mark>${values[i]}</mark>` : '');
  }, '');
}

const result = highlight`Hello ${name}, you have ${count} messages`;
```

#### 箭头函数深入

```javascript
// 基本语法
const add = (a, b) => a + b;
const square = x => x * x;
const greet = () => 'Hello';

// 返回对象字面量
const createObj = () => ({ name: 'test' });

// 箭头函数特点
// 1. 没有自己的 this
// 2. 没有 arguments 对象
// 3. 不能用作构造函数
// 4. 没有 prototype 属性

// 使用场景
const numbers = [1, 2, 3];
numbers.map(n => n * 2);
numbers.filter(n => n > 1);
```

#### 类与继承

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    console.log(`${this.name} makes a sound`);
  }
  
  // 静态方法
  static getSpecies() {
    return 'Animal';
  }
  
  // 私有字段 (ES2022)
  #privateField = 'secret';
  
  // 私有方法
  #privateMethod() {
    return this.#privateField;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);
    this.breed = breed;
  }
  
  speak() {
    console.log(`${this.name} barks`);
  }
}

const dog = new Dog('Buddy', 'Golden Retriever');
```

#### 模块系统

```javascript
// 导出
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export default class Calculator {}

// 导入
import Calculator, { PI, add } from './math.js';
import * as math from './math.js';
import { add as sum } from './math.js';

// 动态导入
async function loadModule() {
  const module = await import('./math.js');
  return module.default;
}
```

---

### 🔟 错误处理与调试

#### 错误类型

```javascript
// 基本错误类型
try {
  throw new Error('Generic error');
  throw new TypeError('Type error');
  throw new ReferenceError('Reference error');
  throw new SyntaxError('Syntax error');
} catch (error) {
  console.log(error.name);     // 错误类型
  console.log(error.message);  // 错误信息
  console.log(error.stack);    // 堆栈信息
}

// 自定义错误
class CustomError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'CustomError';
    this.code = code;
  }
}

// 异步错误处理
async function handleAsyncError() {
  try {
    await riskyOperation();
  } catch (error) {
    if (error instanceof CustomError) {
      // 处理自定义错误
    } else {
      // 处理其他错误
    }
  }
}

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
```

#### 调试技巧

```javascript
// console 方法
console.log('基本输出');
console.error('错误信息');
console.warn('警告信息');
console.info('信息');
console.debug('调试信息');

console.table([{name: 'Alice', age: 25}, {name: 'Bob', age: 30}]);
console.group('分组开始');
console.log('分组内容');
console.groupEnd();

console.time('timer');
// 一些操作
console.timeEnd('timer');

console.trace('追踪调用栈');

// 断点调试
debugger; // 在浏览器中会暂停执行

// 性能监控
performance.mark('start');
// 一些操作
performance.mark('end');
performance.measure('operation', 'start', 'end');
```

---

## 二、浏览器基础（前端核心）

### 1️⃣ DOM 操作详解

#### DOM 树结构

```javascript
// DOM 节点类型
Node.ELEMENT_NODE;          // 1 - 元素节点
Node.TEXT_NODE;             // 3 - 文本节点
Node.COMMENT_NODE;          // 8 - 注释节点
Node.DOCUMENT_NODE;         // 9 - 文档节点

// 节点关系
element.parentNode;         // 父节点
element.childNodes;         // 所有子节点
element.children;           // 元素子节点
element.firstChild;         // 第一个子节点
element.lastChild;          // 最后一个子节点
element.nextSibling;        // 下一个兄弟节点
element.previousSibling;    // 上一个兄弟节点
```

#### 元素获取与操作

```javascript
// 获取元素
document.getElementById('id');
document.getElementsByClassName('class');
document.getElementsByTagName('tag');
document.querySelector('.class');
document.querySelectorAll('.class');

// 创建和插入元素
const div = document.createElement('div');
div.textContent = 'Hello World';
div.innerHTML = '<span>HTML content</span>';

parent.appendChild(div);
parent.insertBefore(div, referenceNode);
parent.removeChild(div);
parent.replaceChild(newNode, oldNode);

// 属性操作
element.getAttribute('attr');
element.setAttribute('attr', 'value');
element.removeAttribute('attr');
element.hasAttribute('attr');

// 样式操作
element.style.color = 'red';
element.style.cssText = 'color: red; font-size: 16px;';
element.className = 'new-class';
element.classList.add('class');
element.classList.remove('class');
element.classList.toggle('class');
element.classList.contains('class');
```

#### 现代 DOM API

```javascript
// 更现代的插入方法
element.append(node1, node2, 'text');
element.prepend(node1, node2);
element.before(node);
element.after(node);
element.replaceWith(newNode);
element.remove();

// 查找方法
element.closest('.parent-class');  // 向上查找
element.matches('.selector');      // 是否匹配选择器

// 位置和尺寸
element.getBoundingClientRect();   // 元素位置信息
element.offsetWidth;               // 包含边框的宽度
element.clientWidth;               // 不包含边框的宽度
element.scrollWidth;               // 滚动宽度
```

---

### 2️⃣ 事件机制（重点）

#### 事件流程

```javascript
// 事件流：捕获 -> 目标 -> 冒泡
document.addEventListener('click', handler, true);  // 捕获阶段
document.addEventListener('click', handler, false); // 冒泡阶段

// 事件对象
function handleClick(event) {
  event.type;              // 事件类型
  event.target;            // 触发事件的元素
  event.currentTarget;     // 绑定事件的元素
  event.preventDefault();  // 阻止默认行为
  event.stopPropagation(); // 阻止事件传播
  event.stopImmediatePropagation(); // 阻止同元素其他监听器
}
```

#### 事件委托（性能优化）

```javascript
// 传统方式 - 为每个按钮绑定事件
document.querySelectorAll('.button').forEach(btn => {
  btn.addEventListener('click', handleClick);
});

// 事件委托 - 只绑定一个事件
document.addEventListener('click', function(event) {
  if (event.target.matches('.button')) {
    handleClick(event);
  }
});

// 实用的事件委托函数
function delegate(parent, selector, event, handler) {
  parent.addEventListener(event, function(e) {
    if (e.target.matches(selector)) {
      handler.call(e.target, e);
    }
  });
}

delegate(document, '.button', 'click', function(e) {
  console.log('Button clicked:', this.textContent);
});
```

#### 常见事件类型

```javascript
// 鼠标事件
element.addEventListener('click', handler);
element.addEventListener('dblclick', handler);
element.addEventListener('mousedown', handler);
element.addEventListener('mouseup', handler);
element.addEventListener('mouseover', handler);
element.addEventListener('mouseout', handler);
element.addEventListener('mouseenter', handler);  // 不冒泡
element.addEventListener('mouseleave', handler);  // 不冒泡

// 键盘事件
element.addEventListener('keydown', handler);
element.addEventListener('keyup', handler);
element.addEventListener('keypress', handler);    // 已废弃

// 表单事件
element.addEventListener('submit', handler);
element.addEventListener('change', handler);
element.addEventListener('input', handler);
element.addEventListener('focus', handler);
element.addEventListener('blur', handler);

// 窗口事件
window.addEventListener('load', handler);
window.addEventListener('DOMContentLoaded', handler);
window.addEventListener('resize', handler);
window.addEventListener('scroll', handler);
```

#### 自定义事件

```javascript
// 创建自定义事件
const customEvent = new CustomEvent('myEvent', {
  detail: { message: 'Hello World' },
  bubbles: true,
  cancelable: true
});

// 触发事件
element.dispatchEvent(customEvent);

// 监听自定义事件
element.addEventListener('myEvent', function(event) {
  console.log(event.detail.message);
});

// 事件总线模式
class EventBus {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
  
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}
```

---

### 3️⃣ 浏览器渲染机制（面试重点）

#### 渲染流程

```
1. HTML 解析 → DOM Tree
2. CSS 解析 → CSSOM Tree  
3. DOM + CSSOM → Render Tree
4. Layout (Reflow) → 计算位置尺寸
5. Paint (Repaint) → 绘制像素
6. Composite → 合成层
```

#### 关键渲染路径优化

```html
<!-- 1. 减少关键资源 -->
<link rel="preload" href="critical.css" as="style">
<link rel="dns-prefetch" href="//example.com">

<!-- 2. 减少关键字节 -->
<style>
  /* 内联关键 CSS */
  .above-fold { display: block; }
</style>

<!-- 3. 减少关键路径长度 -->
<script async src="non-critical.js"></script>
<script defer src="dom-dependent.js"></script>
```

#### Reflow 和 Repaint

```javascript
// 引起 Reflow 的操作（昂贵）
element.style.width = '100px';
element.style.height = '100px';
element.offsetWidth;              // 读取布局属性
element.scrollTop;
element.getBoundingClientRect();

// 只引起 Repaint 的操作（相对便宜）
element.style.color = 'red';
element.style.backgroundColor = 'blue';
element.style.visibility = 'hidden';

// 优化策略
// 1. 批量修改样式
element.style.cssText = 'width: 100px; height: 100px; color: red;';

// 2. 使用 class 替代直接样式修改
element.className = 'new-style';

// 3. 离线操作 DOM
const fragment = document.createDocumentFragment();
// 在 fragment 中操作
document.body.appendChild(fragment);

// 4. 使用 transform 和 opacity（不触发 reflow）
element.style.transform = 'translateX(100px)';
element.style.opacity = '0.5';
```

#### 浏览器缓存机制

```javascript
// 强缓存
// Cache-Control: max-age=3600
// Expires: Wed, 21 Oct 2025 07:28:00 GMT

// 协商缓存
// Last-Modified / If-Modified-Since
// ETag / If-None-Match

// Service Worker 缓存
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
```

---

### 4️⃣ Web API 详解

#### Fetch API

```javascript
// 基本用法
fetch('/api/data')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// 高级配置
fetch('/api/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  },
  body: JSON.stringify({ key: 'value' }),
  credentials: 'include',  // 包含 cookies
  cache: 'no-cache',
  redirect: 'follow'
})

// 取消请求
const controller = new AbortController();
fetch('/api/data', { signal: controller.signal });
controller.abort(); // 取消请求

// 超时处理
function fetchWithTimeout(url, options = {}, timeout = 5000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}
```

#### Web Storage

```javascript
// localStorage (持久化)
localStorage.setItem('key', 'value');
localStorage.getItem('key');
localStorage.removeItem('key');
localStorage.clear();

// sessionStorage (会话级)
sessionStorage.setItem('key', 'value');

// 存储对象
const user = { name: 'Alice', age: 25 };
localStorage.setItem('user', JSON.stringify(user));
const savedUser = JSON.parse(localStorage.getItem('user'));

// 监听存储变化
window.addEventListener('storage', function(e) {
  console.log('Storage changed:', e.key, e.oldValue, e.newValue);
});

// IndexedDB (大量数据)
const request = indexedDB.open('MyDB', 1);
request.onsuccess = function(event) {
  const db = event.target.result;
  // 数据库操作
};
```

#### Intersection Observer

```javascript
// 懒加载图片
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img);
});

// 无限滚动
const loadMoreObserver = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    loadMoreContent();
  }
});

loadMoreObserver.observe(document.querySelector('.load-more-trigger'));
```

---

## 三、React 深度解析（现代前端核心）

### 1️⃣ React 核心思想深入

#### 组件化思维

```jsx
// 函数组件 vs 类组件
// 函数组件（推荐）
function Welcome({ name, children }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      {children}
    </div>
  );
}

// 类组件（了解即可）
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}!</h1>;
  }
}

// 组件组合 vs 继承
function Dialog({ title, children }) {
  return (
    <div className="dialog">
      <h1>{title}</h1>
      <div className="dialog-content">
        {children}
      </div>
    </div>
  );
}

function WelcomeDialog() {
  return (
    <Dialog title="Welcome">
      <p>Thank you for visiting!</p>
    </Dialog>
  );
}
```

#### 单向数据流

```jsx
// 数据向下流动，事件向上传递
function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <Counter 
        value={count} 
        onIncrement={() => setCount(count + 1)}
        onDecrement={() => setCount(count - 1)}
      />
    </div>
  );
}

function Counter({ value, onIncrement, onDecrement }) {
  return (
    <div>
      <button onClick={onDecrement}>-</button>
      <span>{value}</span>
      <button onClick={onIncrement}>+</button>
    </div>
  );
}
```

---

### 2️⃣ JSX 深入理解

#### JSX 本质

```jsx
// JSX 语法
const element = <h1 className="greeting">Hello, world!</h1>;

// 编译后的 JavaScript
const element = React.createElement(
  'h1',
  { className: 'greeting' },
  'Hello, world!'
);

// 复杂 JSX
const element = (
  <div>
    <h1>{user.name}</h1>
    {user.isLoggedIn && <p>Welcome back!</p>}
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  </div>
);
```

#### JSX 最佳实践

```jsx
// 1. 条件渲染
function UserGreeting({ user }) {
  if (!user) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      {user.isAdmin && <AdminPanel />}
      {user.notifications.length > 0 ? (
        <NotificationList notifications={user.notifications} />
      ) : (
        <p>No new notifications</p>
      )}
    </div>
  );
}

// 2. 列表渲染
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem 
          key={todo.id}  // 重要：稳定的 key
          todo={todo}
          onToggle={() => handleToggle(todo.id)}
          onDelete={() => handleDelete(todo.id)}
        />
      ))}
    </ul>
  );
}

// 3. 事件处理
function Button({ onClick, children, disabled = false }) {
  const handleClick = useCallback((event) => {
    event.preventDefault();
    if (!disabled && onClick) {
      onClick(event);
    }
  }, [disabled, onClick]);
  
  return (
    <button 
      onClick={handleClick}
      disabled={disabled}
      className={`btn ${disabled ? 'btn-disabled' : 'btn-active'}`}
    >
      {children}
    </button>
  );
}
```

---

### 3️⃣ Hooks 深度解析（重点）

#### useState 进阶

```jsx
// 基本用法
const [count, setCount] = useState(0);

// 函数式更新
const [count, setCount] = useState(0);
setCount(prevCount => prevCount + 1);

// 惰性初始化
const [state, setState] = useState(() => {
  const initialState = someExpensiveComputation();
  return initialState;
});

// 对象状态更新
const [user, setUser] = useState({ name: '', email: '' });
setUser(prevUser => ({ ...prevUser, name: 'Alice' }));

// 自定义 Hook 封装状态逻辑
function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback(() => setCount(c => c + 1), []);
  const decrement = useCallback(() => setCount(c => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);
  
  return { count, increment, decrement, reset };
}
```

#### useEffect 深度理解

```jsx
// 基本用法
useEffect(() => {
  // 副作用逻辑
  document.title = `Count: ${count}`;
}, [count]); // 依赖数组

// 清理副作用
useEffect(() => {
  const timer = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  
  return () => clearInterval(timer); // 清理函数
}, []);

// 条件执行
useEffect(() => {
  if (user.id) {
    fetchUserData(user.id);
  }
}, [user.id]);

// 自定义 Hook 封装副作用
function useDocumentTitle(title) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    
    return () => {
      document.title = prevTitle;
    };
  }, [title]);
}

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });
  
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [key, value]);
  
  return [value, setValue];
}
```

#### 性能优化 Hooks

```jsx
// useMemo - 缓存计算结果
function ExpensiveComponent({ items, filter }) {
  const filteredItems = useMemo(() => {
    return items.filter(item => item.category === filter);
  }, [items, filter]);
  
  const expensiveValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);
  
  return (
    <div>
      <p>Total: ${expensiveValue}</p>
      <ItemList items={filteredItems} />
    </div>
  );
}

// useCallback - 缓存函数
function TodoList({ todos, onToggle, onDelete }) {
  const handleToggle = useCallback((id) => {
    onToggle(id);
  }, [onToggle]);
  
  const handleDelete = useCallback((id) => {
    onDelete(id);
  }, [onDelete]);
  
  return (
    <ul>
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  );
}

// React.memo - 组件记忆化
const TodoItem = React.memo(({ todo, onToggle, onDelete }) => {
  return (
    <li>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span>{todo.text}</span>
      <button onClick={() => onDelete(todo.id)}>Delete</button>
    </li>
  );
});
```

#### 其他重要 Hooks

```jsx
// useRef - 引用 DOM 或保存可变值
function TextInput() {
  const inputRef = useRef(null);
  const countRef = useRef(0);
  
  useEffect(() => {
    inputRef.current.focus();
  }, []);
  
  const handleClick = () => {
    countRef.current += 1;
    console.log('Clicked', countRef.current, 'times');
  };
  
  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={handleClick}>Click me</button>
    </div>
  );
}

// useContext - 跨组件状态共享
const ThemeContext = createContext();

function App() {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Header />
      <Main />
    </ThemeContext.Provider>
  );
}

function Header() {
  const { theme, setTheme } = useContext(ThemeContext);
  
  return (
    <header className={`header-${theme}`}>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </header>
  );
}

// useReducer - 复杂状态管理
function todoReducer(state, action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, { id: Date.now(), text: action.text, completed: false }];
    case 'TOGGLE_TODO':
      return state.map(todo =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo
      );
    case 'DELETE_TODO':
      return state.filter(todo => todo.id !== action.id);
    default:
      return state;
  }
}

function TodoApp() {
  const [todos, dispatch] = useReducer(todoReducer, []);
  
  const addTodo = (text) => {
    dispatch({ type: 'ADD_TODO', text });
  };
  
  const toggleTodo = (id) => {
    dispatch({ type: 'TOGGLE_TODO', id });
  };
  
  return (
    <div>
      <AddTodo onAdd={addTodo} />
      <TodoList todos={todos} onToggle={toggleTodo} />
    </div>
  );
}
```

---

### 4️⃣ React 生命周期与错误边界

#### 类组件生命周期（了解）

```jsx
class LifecycleDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    console.log('1. Constructor');
  }
  
  static getDerivedStateFromProps(props, state) {
    console.log('2. getDerivedStateFromProps');
    return null;
  }
  
  componentDidMount() {
    console.log('3. componentDidMount');
    // 适合：数据获取、订阅、DOM 操作
  }
  
  shouldComponentUpdate(nextProps, nextState) {
    console.log('4. shouldComponentUpdate');
    return true; // 返回 false 可以阻止更新
  }
  
  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log('5. getSnapshotBeforeUpdate');
    return null;
  }
  
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('6. componentDidUpdate');
    // 适合：DOM 更新后的操作
  }
  
  componentWillUnmount() {
    console.log('7. componentWillUnmount');
    // 适合：清理定时器、取消订阅
  }
  
  render() {
    console.log('Render');
    return <div>Count: {this.state.count}</div>;
  }
}
```

#### 错误边界

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // 可以发送错误报告到服务器
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// 使用错误边界
function App() {
  return (
    <ErrorBoundary>
      <Header />
      <Main />
    </ErrorBoundary>
  );
}

// React 18 中的错误边界 Hook（实验性）
function useErrorBoundary() {
  const [error, setError] = useState(null);
  
  if (error) {
    throw error;
  }
  
  return setError;
}
```

---

### 5️⃣ React 性能优化

#### 渲染优化策略

```jsx
// 1. 避免在 render 中创建对象/函数
// ❌ 不好的做法
function BadComponent({ items }) {
  return (
    <div>
      {items.map(item => (
        <Item 
          key={item.id} 
          item={item}
          onClick={() => handleClick(item.id)} // 每次都创建新函数
          style={{ color: 'red' }}             // 每次都创建新对象
        />
      ))}
    </div>
  );
}

// ✅ 好的做法
function GoodComponent({ items }) {
  const handleClick = useCallback((id) => {
    // 处理点击
  }, []);
  
  const itemStyle = useMemo(() => ({ color: 'red' }), []);
  
  return (
    <div>
      {items.map(item => (
        <Item 
          key={item.id} 
          item={item}
          onClick={handleClick}
          style={itemStyle}
        />
      ))}
    </div>
  );
}

// 2. 组件拆分
// ❌ 大组件
function BigComponent({ user, posts, comments }) {
  const [filter, setFilter] = useState('');
  
  return (
    <div>
      <UserProfile user={user} />
      <PostList posts={posts} filter={filter} />
      <CommentList comments={comments} />
      <FilterInput value={filter} onChange={setFilter} />
    </div>
  );
}

// ✅ 拆分后的组件
function App({ user, posts, comments }) {
  return (
    <div>
      <UserProfile user={user} />
      <PostSection posts={posts} />
      <CommentSection comments={comments} />
    </div>
  );
}

function PostSection({ posts }) {
  const [filter, setFilter] = useState('');
  
  return (
    <div>
      <FilterInput value={filter} onChange={setFilter} />
      <PostList posts={posts} filter={filter} />
    </div>
  );
}
```

#### 虚拟化长列表

```jsx
// 使用 react-window 进行虚拟化
import { FixedSizeList as List } from 'react-window';

function VirtualizedList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <Item item={items[index]} />
    </div>
  );
  
  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  );
}

// 自定义虚拟化 Hook
function useVirtualization({ items, containerHeight, itemHeight }) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  
  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    offsetY: visibleStart * itemHeight,
    onScroll: (e) => setScrollTop(e.target.scrollTop)
  };
}
```

---

## 四、Vue 深度解析（渐进式框架）

### 1️⃣ Vue 响应式原理

#### Vue 2 响应式

```javascript
// Object.defineProperty 实现
function defineReactive(obj, key, val) {
  const dep = new Dep();
  
  Object.defineProperty(obj, key, {
    get() {
      if (Dep.target) {
        dep.depend();
      }
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      val = newVal;
      dep.notify();
    }
  });
}

// 依赖收集
class Dep {
  constructor() {
    this.subs = [];
  }
  
  depend() {
    if (Dep.target) {
      this.subs.push(Dep.target);
    }
  }
  
  notify() {
    this.subs.forEach(sub => sub.update());
  }
}

// 观察者
class Watcher {
  constructor(vm, exp, cb) {
    this.vm = vm;
    this.exp = exp;
    this.cb = cb;
    this.value = this.get();
  }
  
  get() {
    Dep.target = this;
    const value = this.vm[this.exp];
    Dep.target = null;
    return value;
  }
  
  update() {
    const newValue = this.get();
    if (newValue !== this.value) {
      this.value = newValue;
      this.cb.call(this.vm, newValue);
    }
  }
}
```

#### Vue 3 响应式

```javascript
// Proxy 实现
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key);
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key);
      return result;
    }
  });
}

// 依赖追踪
const targetMap = new WeakMap();

function track(target, key) {
  if (!activeEffect) return;
  
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  
  dep.add(activeEffect);
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  
  const dep = depsMap.get(key);
  if (dep) {
    dep.forEach(effect => effect());
  }
}

// 副作用函数
let activeEffect = null;

function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}
```

---

### 2️⃣ Vue 3 Composition API

#### 基础 API

```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <p>Count: {{ count }}</p>
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
    
    <input v-model="searchTerm" placeholder="Search...">
    <ul>
      <li v-for="item in filteredItems" :key="item.id">
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';

export default {
  setup() {
    // 响应式数据
    const title = ref('Vue 3 Demo');
    const count = ref(0);
    const searchTerm = ref('');
    
    const state = reactive({
      items: [],
      loading: false
    });
    
    // 计算属性
    const filteredItems = computed(() => {
      return state.items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.value.toLowerCase())
      );
    });
    
    // 方法
    const increment = () => count.value++;
    const decrement = () => count.value--;
    
    const fetchItems = async () => {
      state.loading = true;
      try {
        const response = await fetch('/api/items');
        state.items = await response.json();
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        state.loading = false;
      }
    };
    
    // 监听器
    watch(count, (newCount, oldCount) => {
      console.log(`Count changed from ${oldCount} to ${newCount}`);
    });
    
    watch(searchTerm, (newTerm) => {
      console.log('Search term:', newTerm);
    }, { immediate: true });
    
    // 生命周期
    onMounted(() => {
      fetchItems();
    });
    
    let timer;
    onMounted(() => {
      timer = setInterval(() => {
        console.log('Timer tick');
      }, 1000);
    });
    
    onUnmounted(() => {
      if (timer) {
        clearInterval(timer);
      }
    });
    
    // 返回模板需要的数据和方法
    return {
      title,
      count,
      searchTerm,
      filteredItems,
      increment,
      decrement,
      loading: computed(() => state.loading)
    };
  }
};
</script>
```

#### 自定义组合函数

```javascript
// useCounter.js
import { ref, computed } from 'vue';

export function useCounter(initialValue = 0) {
  const count = ref(initialValue);
  
  const increment = () => count.value++;
  const decrement = () => count.value--;
  const reset = () => count.value = initialValue;
  
  const isEven = computed(() => count.value % 2 === 0);
  
  return {
    count,
    increment,
    decrement,
    reset,
    isEven
  };
}

// useFetch.js
import { ref, reactive } from 'vue';

export function useFetch(url) {
  const data = ref(null);
  const error = ref(null);
  const loading = ref(false);
  
  const execute = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      data.value = await response.json();
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };
  
  return {
    data,
    error,
    loading,
    execute
  };
}

// 使用自定义组合函数
export default {
  setup() {
    const { count, increment, decrement, isEven } = useCounter(10);
    const { data: users, loading, execute: fetchUsers } = useFetch('/api/users');
    
    onMounted(() => {
      fetchUsers();
    });
    
    return {
      count,
      increment,
      decrement,
      isEven,
      users,
      loading
    };
  }
};
```

---

### 3️⃣ Vue 指令与组件通信

#### 自定义指令

```javascript
// 全局指令
app.directive('focus', {
  mounted(el) {
    el.focus();
  }
});

app.directive('color', {
  beforeMount(el, binding) {
    el.style.color = binding.value;
  },
  updated(el, binding) {
    el.style.color = binding.value;
  }
});

// 局部指令
export default {
  directives: {
    focus: {
      mounted(el) {
        el.focus();
      }
    },
    clickOutside: {
      beforeMount(el, binding) {
        el.clickOutsideEvent = function(event) {
          if (!(el === event.target || el.contains(event.target))) {
            binding.value(event);
          }
        };
        document.addEventListener('click', el.clickOutsideEvent);
      },
      unmounted(el) {
        document.removeEventListener('click', el.clickOutsideEvent);
      }
    }
  }
};

// 使用指令
// <input v-focus>
// <div v-color="'red'">Red text</div>
// <div v-click-outside="handleClickOutside">Click outside to close</div>
```

#### 组件通信

```vue
<!-- 父子组件通信 -->
<!-- Parent.vue -->
<template>
  <div>
    <Child 
      :message="parentMessage"
      @update="handleUpdate"
    />
  </div>
</template>

<script>
import Child from './Child.vue';

export default {
  components: { Child },
  data() {
    return {
      parentMessage: 'Hello from parent'
    };
  },
  methods: {
    handleUpdate(data) {
      console.log('Received from child:', data);
    }
  }
};
</script>

<!-- Child.vue -->
<template>
  <div>
    <p>{{ message }}</p>
    <button @click="sendToParent">Send to Parent</button>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: true,
      default: 'Default message'
    }
  },
  emits: ['update'],
  methods: {
    sendToParent() {
      this.$emit('update', 'Data from child');
    }
  }
};
</script>

<!-- 跨组件通信 - Provide/Inject -->
<!-- Ancestor.vue -->
<script>
export default {
  provide() {
    return {
      theme: 'dark',
      user: this.user
    };
  },
  data() {
    return {
      user: { name: 'Alice', role: 'admin' }
    };
  }
};
</script>

<!-- Descendant.vue -->
<script>
export default {
  inject: ['theme', 'user'],
  mounted() {
    console.log(this.theme); // 'dark'
    console.log(this.user);  // { name: 'Alice', role: 'admin' }
  }
};
</script>

<!-- 事件总线 -->
<script>
// eventBus.js
import { createApp } from 'vue';
export const eventBus = createApp({}).config.globalProperties;

// 发送事件
eventBus.$emit('custom-event', data);

// 监听事件
eventBus.$on('custom-event', (data) => {
  console.log('Received:', data);
});

// 移除监听
eventBus.$off('custom-event');
</script>
```

---

## 五、现代前端框架与工具

### 1️⃣ Next.js 深度解析

#### 渲染模式详解

```jsx
// 1. 静态生成 (SSG)
export async function getStaticProps() {
  const posts = await fetchPosts();
  
  return {
    props: { posts },
    revalidate: 60 // ISR: 60秒后重新生成
  };
}

export async function getStaticPaths() {
  const posts = await fetchPosts();
  const paths = posts.map(post => ({
    params: { id: post.id.toString() }
  }));
  
  return {
    paths,
    fallback: 'blocking' // 或 true, false
  };
}

// 2. 服务端渲染 (SSR)
export async function getServerSideProps(context) {
  const { req, res, params, query } = context;
  const user = await fetchUser(req);
  
  if (!user) {
    return {
      redirect: {
        destination: '/login',
        permanent: false
      }
    };
  }
  
  return {
    props: { user }
  };
}

// 3. 客户端渲染 (CSR)
function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser().then(userData => {
      setUser(userData);
      setLoading(false);
    });
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user found</div>;
  
  return <div>Welcome, {user.name}!</div>;
}
```

#### App Router (Next.js 13+)

```jsx
// app/layout.js - 根布局
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header>
          <nav>Navigation</nav>
        </header>
        <main>{children}</main>
        <footer>Footer</footer>
      </body>
    </html>
  );
}

// app/page.js - 首页
export default function HomePage() {
  return <h1>Welcome to Next.js 13!</h1>;
}

// app/blog/page.js - 博客列表页
export default async function BlogPage() {
  const posts = await fetchPosts();
  
  return (
    <div>
      <h1>Blog Posts</h1>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}

// app/blog/[slug]/page.js - 博客详情页
export default async function BlogPost({ params }) {
  const post = await fetchPost(params.slug);
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}

// 生成静态参数
export async function generateStaticParams() {
  const posts = await fetchPosts();
  
  return posts.map(post => ({
    slug: post.slug
  }));
}
```

#### API Routes

```javascript
// pages/api/users.js (Pages Router)
export default function handler(req, res) {
  if (req.method === 'GET') {
    // 获取用户列表
    const users = await getUsers();
    res.status(200).json(users);
  } else if (req.method === 'POST') {
    // 创建用户
    const newUser = await createUser(req.body);
    res.status(201).json(newUser);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// app/api/users/route.js (App Router)
export async function GET() {
  const users = await getUsers();
  return Response.json(users);
}

export async function POST(request) {
  const body = await request.json();
  const newUser = await createUser(body);
  return Response.json(newUser, { status: 201 });
}

// 中间件
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // 检查认证
  const token = request.cookies.get('token');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 添加自定义头
  const response = NextResponse.next();
  response.headers.set('X-Custom-Header', 'value');
  
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
};
```

---

### 2️⃣ Vite 深度解析

#### 配置详解

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html')
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'axios']
        }
      }
    }
  },
  
  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils')
    }
  },
  
  // 环境变量
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  
  // CSS 配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    },
    modules: {
      localsConvention: 'camelCase'
    }
  }
});
```

#### 插件开发

```javascript
// 自定义插件
function myPlugin() {
  return {
    name: 'my-plugin',
    configResolved(config) {
      // 配置解析完成后调用
      console.log('Config resolved:', config);
    },
    buildStart() {
      // 构建开始时调用
      console.log('Build started');
    },
    transform(code, id) {
      // 转换代码
      if (id.endsWith('.special')) {
        return `export default ${JSON.stringify(code)}`;
      }
    },
    generateBundle(options, bundle) {
      // 生成 bundle 时调用
      console.log('Bundle generated');
    }
  };
}

// 使用插件
export default defineConfig({
  plugins: [
    react(),
    myPlugin()
  ]
});
```

#### HMR (热模块替换)

```javascript
// 接受自身更新
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 更新逻辑
    console.log('Module updated:', newModule);
  });
}

// 接受依赖更新
if (import.meta.hot) {
  import.meta.hot.accept('./dependency.js', (newDep) => {
    // 依赖更新时的处理
    updateDependency(newDep);
  });
}

// 处理状态保持
if (import.meta.hot) {
  import.meta.hot.dispose((data) => {
    // 保存状态
    data.state = getCurrentState();
  });
  
  import.meta.hot.accept((newModule) => {
    // 恢复状态
    if (import.meta.hot.data.state) {
      restoreState(import.meta.hot.data.state);
    }
  });
}
```

---

## 六、前端工程化与性能优化

### 1️⃣ 模块化系统

#### ES Modules vs CommonJS

```javascript
// ES Modules (现代标准)
// 导出
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export default class Calculator {}

// 导入
import Calculator, { PI, add } from './math.js';
import * as math from './math.js';
import { add as sum } from './math.js';

// 动态导入
async function loadModule() {
  const { default: Calculator } = await import('./math.js');
  return new Calculator();
}

// CommonJS (Node.js)
// 导出
module.exports = {
  PI: 3.14159,
  add: (a, b) => a + b
};

// 或者
exports.PI = 3.14159;
exports.add = (a, b) => a + b;

// 导入
const { PI, add } = require('./math');
const math = require('./math');

// 条件导入
if (condition) {
  const module = require('./conditional-module');
}
```

#### 模块打包原理

```javascript
// 简化的打包器实现
class SimpleBundler {
  constructor(entry) {
    this.entry = entry;
    this.modules = new Map();
  }
  
  // 解析模块依赖
  parseModule(filename) {
    const content = fs.readFileSync(filename, 'utf-8');
    const ast = parse(content); // 解析 AST
    const dependencies = [];
    
    traverse(ast, {
      ImportDeclaration(path) {
        dependencies.push(path.node.source.value);
      }
    });
    
    const code = transformFromAst(ast).code;
    
    return {
      filename,
      dependencies,
      code
    };
  }
  
  // 构建依赖图
  buildDependencyGraph() {
    const queue = [this.entry];
    const visited = new Set();
    
    while (queue.length > 0) {
      const filename = queue.shift();
      
      if (visited.has(filename)) continue;
      visited.add(filename);
      
      const module = this.parseModule(filename);
      this.modules.set(filename, module);
      
      module.dependencies.forEach(dep => {
        queue.push(resolve(dirname(filename), dep));
      });
    }
  }
  
  // 生成 bundle
  generateBundle() {
    let bundle = '(function(modules) {\n';
    bundle += '  const require = (id) => {\n';
    bundle += '    const module = { exports: {} };\n';
    bundle += '    modules[id](module, module.exports, require);\n';
    bundle += '    return module.exports;\n';
    bundle += '  };\n';
    bundle += '  require("' + this.entry + '");\n';
    bundle += '})({';
    
    this.modules.forEach((module, filename) => {
      bundle += `"${filename}": function(module, exports, require) {\n`;
      bundle += module.code;
      bundle += '\n},';
    });
    
    bundle += '});';
    return bundle;
  }
}
```

---

### 2️⃣ 跨域解决方案

#### CORS 详解

```javascript
// 服务端设置 CORS
app.use((req, res, next) => {
  // 允许的源
  const allowedOrigins = ['http://localhost:3000', 'https://example.com'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // 允许的方法
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // 允许的头部
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // 允许携带凭证
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // 预检请求缓存时间
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// 客户端发送请求
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  },
  credentials: 'include', // 携带 cookies
  body: JSON.stringify({ key: 'value' })
});
```

#### JSONP 实现

```javascript
// JSONP 客户端实现
function jsonp(url, callback, callbackName = 'callback') {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const callbackId = `jsonp_${Date.now()}_${Math.random().toString(36).substr(2)}`;
    
    // 全局回调函数
    window[callbackId] = function(data) {
      resolve(data);
      document.head.removeChild(script);
      delete window[callbackId];
    };
    
    // 错误处理
    script.onerror = function() {
      reject(new Error('JSONP request failed'));
      document.head.removeChild(script);
      delete window[callbackId];
    };
    
    // 构建 URL
    const separator = url.includes('?') ? '&' : '?';
    script.src = `${url}${separator}${callbackName}=${callbackId}`;
    
    document.head.appendChild(script);
  });
}

// 使用 JSONP
jsonp('https://api.example.com/data', 'callback')
  .then(data => console.log(data))
  .catch(error => console.error(error));

// 服务端支持 JSONP
app.get('/api/data', (req, res) => {
  const data = { message: 'Hello JSONP' };
  const callback = req.query.callback;
  
  if (callback) {
    // JSONP 响应
    res.type('application/javascript');
    res.send(`${callback}(${JSON.stringify(data)})`);
  } else {
    // 普通 JSON 响应
    res.json(data);
  }
});
```

#### 代理服务器

```javascript
// Webpack Dev Server 代理
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
};

// Vite 代理
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});

// Express 代理中间件
const { createProxyMiddleware } = require('http-proxy-middleware');

app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8080',
  changeOrigin: true,
  pathRewrite: {
    '^/api': ''
  }
}));
```

---

### 3️⃣ 前端缓存策略

#### HTTP 缓存

```javascript
// 强缓存
// Cache-Control: max-age=31536000 (1年)
// Expires: Wed, 21 Oct 2025 07:28:00 GMT

// 协商缓存
// Last-Modified / If-Modified-Since
// ETag / If-None-Match

// 缓存策略设置
app.use('/static', express.static('public', {
  maxAge: '1y', // 静态资源缓存1年
  etag: true,   // 启用 ETag
  lastModified: true
}));

// 动态内容缓存控制
app.get('/api/data', (req, res) => {
  res.set({
    'Cache-Control': 'private, max-age=300', // 5分钟
    'ETag': generateETag(data)
  });
  
  res.json(data);
});

// 客户端缓存检查
async function fetchWithCache(url, options = {}) {
  const cacheKey = `cache_${url}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp, maxAge } = JSON.parse(cached);
    if (Date.now() - timestamp < maxAge) {
      return data;
    }
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  // 缓存数据
  localStorage.setItem(cacheKey, JSON.stringify({
    data,
    timestamp: Date.now(),
    maxAge: 5 * 60 * 1000 // 5分钟
  }));
  
  return data;
}
```

#### Service Worker 缓存

```javascript
// sw.js
const CACHE_NAME = 'my-app-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js'
];

// 安装事件
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 拦截请求
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存命中，返回缓存
        if (response) {
          return response;
        }
        
        // 网络请求
        return fetch(event.request).then(response => {
          // 检查响应是否有效
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // 克隆响应
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});

// 注册 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('SW registered:', registration);
    })
    .catch(error => {
      console.log('SW registration failed:', error);
    });
}
```

#### 内存缓存实现

```javascript
// LRU 缓存实现
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }
  
  get(key) {
    if (this.cache.has(key)) {
      // 移动到最前面
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }
  
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用的
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }
  
  clear() {
    this.cache.clear();
  }
}

// 使用缓存
const cache = new LRUCache(100);

async function cachedFetch(url) {
  const cached = cache.get(url);
  if (cached) {
    return cached;
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  cache.set(url, data);
  return data;
}
```

---

### 4️⃣ 性能优化策略

#### 代码分割

```javascript
// React 代码分割
import { lazy, Suspense } from 'react';

// 懒加载组件
const LazyComponent = lazy(() => import('./LazyComponent'));

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LazyComponent />
      </Suspense>
    </div>
  );
}

// 路由级别的代码分割
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading page...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// Webpack 代码分割
// 动态导入
async function loadModule() {
  const module = await import(/* webpackChunkName: "my-chunk" */ './module');
  return module.default;
}

// 分离第三方库
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
```

#### 图片优化

```javascript
// 图片懒加载
class LazyImageLoader {
  constructor() {
    this.imageObserver = new IntersectionObserver(this.handleIntersection.bind(this));
    this.init();
  }
  
  init() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => this.imageObserver.observe(img));
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        this.loadImage(img);
        this.imageObserver.unobserve(img);
      }
    });
  }
  
  loadImage(img) {
    const src = img.dataset.src;
    const image = new Image();
    
    image.onload = () => {
      img.src = src;
      img.classList.add('loaded');
    };
    
    image.onerror = () => {
      img.src = '/placeholder.jpg';
      img.classList.add('error');
    };
    
    image.src = src;
  }
}

// 响应式图片
function ResponsiveImage({ src, alt, sizes }) {
  const generateSrcSet = (src) => {
    const sizes = [320, 640, 960, 1280];
    return sizes.map(size => 
      `${src}?w=${size} ${size}w`
    ).join(', ');
  };
  
  return (
    <img
      src={src}
      srcSet={generateSrcSet(src)}
      sizes={sizes || "(max-width: 768px) 100vw, 50vw"}
      alt={alt}
      loading="lazy"
    />
  );
}

// WebP 支持检测
function supportsWebP() {
  return new Promise(resolve => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

// 图片格式选择
async function getOptimalImageSrc(baseSrc) {
  const isWebPSupported = await supportsWebP();
  
  if (isWebPSupported) {
    return baseSrc.replace(/\.(jpg|jpeg|png)$/, '.webp');
  }
  
  return baseSrc;
}
```

#### 性能监控

```javascript
// 性能指标收集
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }
  
  init() {
    // 页面加载性能
    window.addEventListener('load', () => {
      this.collectLoadMetrics();
    });
    
    // 用户交互性能
    this.observeUserInteractions();
    
    // 资源加载性能
    this.observeResourceLoading();
  }
  
  collectLoadMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    
    this.metrics.loadTime = {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      dom: navigation.domContentLoadedEventEnd - navigation.navigationStart,
      load: navigation.loadEventEnd - navigation.navigationStart
    };
    
    // Core Web Vitals
    this.collectCoreWebVitals();
  }
  
  collectCoreWebVitals() {
    // LCP (Largest Contentful Paint)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // FID (First Input Delay)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        this.metrics.fid = entry.processingStart - entry.startTime;
      });
    }).observe({ entryTypes: ['first-input'] });
    
    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.metrics.cls = clsValue;
    }).observe({ entryTypes: ['layout-shift'] });
  }
  
  observeUserInteractions() {
    ['click', 'keydown', 'scroll'].forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        const startTime = performance.now();
        
        requestIdleCallback(() => {
          const duration = performance.now() - startTime;
          this.recordInteraction(eventType, duration);
        });
      });
    });
  }
  
  observeResourceLoading() {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (entry.duration > 1000) { // 超过1秒的资源
          console.warn('Slow resource:', entry.name, entry.duration);
        }
      });
    }).observe({ entryTypes: ['resource'] });
  }
  
  recordInteraction(type, duration) {
    if (!this.metrics.interactions) {
      this.metrics.interactions = {};
    }
    
    if (!this.metrics.interactions[type]) {
      this.metrics.interactions[type] = [];
    }
    
    this.metrics.interactions[type].push(duration);
  }
  
  getMetrics() {
    return this.metrics;
  }
  
  sendMetrics() {
    // 发送到分析服务
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.metrics)
    });
  }
}

// 使用性能监控
const monitor = new PerformanceMonitor();

// 页面卸载时发送数据
window.addEventListener('beforeunload', () => {
  monitor.sendMetrics();
});
```

---

## 七、面试高频算法与数据结构

### 1️⃣ 常见算法实现

#### 排序算法

```javascript
// 快速排序
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

// 归并排序
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
}

// 堆排序
function heapSort(arr) {
  buildMaxHeap(arr);
  
  for (let i = arr.length - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, 0, i);
  }
  
  return arr;
}

function buildMaxHeap(arr) {
  const start = Math.floor(arr.length / 2) - 1;
  for (let i = start; i >= 0; i--) {
    heapify(arr, i, arr.length);
  }
}

# frontend-extended