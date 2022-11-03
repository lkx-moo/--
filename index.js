const assert = require("assert");
const { resolve } = require("path");

//assert参考地址: http://javascript.ruanyifeng.com/nodejs/assert.html

const qs = require("qs")

//qs允许您在查询字符串中创建嵌套对象，方法是用方括号将子键的名称括起来[]
qs.parse('foo[bar]=baz')// {foo: {bar: 'baz'}}

// URI 编码的字符串也可以：
qs.parse('a%5Bb%5D=c')//a: { b: 'c' }

//deepEqual方法用来比较两个对象。只要它们的属性一一对应，且值都相等，就认为两个对象相等，否则抛出一个错误。
//格式 assert.deepEqual(actual, expected, [message])
assert.deepEqual(qs.parse('foo[bar]=baz'), {
    foo: {
        bar: 'baz'
    }
});

var obj = Object.create(null)//创建的对象是一个空对象，在该对象上没有继承 Object.prototype 原型链上的属性或者方法

//plainObjects选项时，解析的值作为空对象返回,通过创建Object.create(null)
var nullObject = qs.parse('a[hasOwnProperty]=b', { plainObjects: true });//{a: {hasOwnProperty: "b"}}

console.log(nullObject.__proto__,obj.__proto__,obj)//undefined undefined {} 

assert.deepEqual(nullObject, { a: { hasOwnProperty: 'b' } })//相等，判断通过

//allowPrototypes: true这将允许用户输入覆盖对象原型上的属性
var protoObject = qs.parse('a[hasOwnProperty]=b', { allowPrototypes: true });//{a: {hasOwnProperty: "b",[[Prototype]]: Object},[[Prototype]]: Object}

assert.deepEqual(protoObject, { a: { hasOwnProperty: 'b' } });

console.log(nullObject,protoObject)

assert.deepEqual(qs.parse('foo[bar][baz]=foobarbaz'), {
    foo: {
        bar: {
            baz: 'foobarbaz'
        }
    }
});

var expected = {
    a: {
        b: {
            c: {
                d: {
                    e: {
                        f: {
                            '[g][h][i]': 'j'
                        }
                    }
                }
            }
        }
    }
};
var str = 'a[b][c][d][e][f][g][h][i]=j'

//qs最多只能解析 5 个深度的子对象
var deepObject = qs.parse(str)//

// 这个深度可以通过传递一个depth选项来覆盖qs.parse(string, [options])
var deep = qs.parse('a[b][c][d][e][f][g][h][i]=j', { depth: 1 })

console.log(deep)//{ a: { b: { '[c][d][e][f][g][h][i]': 'j' } } }

//qs默认 URI 对输出进行编码。对象被字符串化,encode可以通过将选项设置为来禁用此编码false
//encode默认为true-->'a%5Bb%5D%5Bc%5D%5Bd%5D%5Be%5D%5Bf%5D%5B%5Bg%5D%5Bh%5D%5Bi%5D%5D=j'
var deepStr = qs.stringify(expected,{ encode: false })

console.log(deepObject,deepStr)

//抛出一个错误
// assert.fail('总是抛出一个错误')

// 默认情况下qs最多只能解析 1000 个参数
var limited = qs.parse('a=b&c=d', { parameterLimit: 1 });
assert.deepEqual(limited, { a: 'b' });

//去除url中的?解析，使用ignoreQueryPrefix
var prefixed = qs.parse('?a=b&c=d',{ignoreQueryPrefix : true})//{a: 'b', c: 'd'}

//指定分隔符解析
var delimited = qs.parse('a=b;c=d', { delimiter: ';' }) //{ a: 'b', c: 'd' }

//指定的分隔符也可以是正则表达式
var regexed = qs.parse('a=b;c=d,e=f', { delimiter: /[;,]/ })//{ a: 'b', c: 'd', e: 'f' }

//选项allowDots可用于启用点表示法：
var withDots = qs.parse('a.b.c=c', { allowDots: true });//{ a: { b: {c: "c"} } }

//如果您必须处理旧版浏览器或服务，还支持将百分比编码的八位字节解码为 iso-8859-1
var oldCharset = qs.parse('a=%A7', { charset: 'iso-8859-1' });//{a: '§'}

// charsetSentinel为true时，参数中的utf8会被忽略，并根据utf8的参数值的编码方式，进行解码
// 当您同时指定charset选项和charsetSentinel选项时，当请求包含可以从中推断实际字符集的utf8参数时，将覆盖该charset字符集
var detectedAsUtf8 = qs.parse('utf8=%E2%9C%93&a=%C3%B8', {
    charset: 'iso-8859-1',
    charsetSentinel: true
});//{a: 'ø'}

//浏览器将复选标记✓编码为&#10003; 当作为iso-8859-1提交时
var detectedAsIso8859_1 = qs.parse('utf8=%26%2310003%3B&a=%F8', {
    charset: 'utf-8',
    charsetSentinel: true
});//{a: 'ø'}
console.log(detectedAsIso8859_1)
// assert.deepEqual(detectedAsIso8859_1, { a: 'ø' });

// 如果要将&#...;语法解码为实际字符，也可以指定interpretNumericEntities选项：
var detectedAsIso8859_2 = qs.parse('a=%26%239786%3B', {
    charset: 'iso-8859-1',
    interpretNumericEntities: true
});//{ a: '☺' }
console.log(detectedAsIso8859_2)
// assert.deepEqual(detectedAsIso8859_1, { a: '☺' });

/**数组的解析 */

var withArray = qs.parse('a[]=b&a[]=c');//{ a: ['b', 'c'] }
assert.deepEqual(withArray, { a: ['b', 'c'] })

var withIndexes = qs.parse('a[1]=c&a[0]=b')
assert.deepEqual(withIndexes, { a: ['b', 'c'] })

// qs会将稀疏数组压缩为仅保留其顺序的现有值
var noSparse = qs.parse('a[1]=b&a[15]=c')
assert.deepEqual(noSparse, { a: ['b', 'c'] })

// 可以使用allowSparse 来解析稀疏数组
var sparseArray = qs.parse('a[1]=2&a[3]=5', { allowSparse: true })//{ a: [, '2', , '5'] }
assert.deepEqual(sparseArray, { a: [, '2', , '5'] })

// 空字符串也是一个值，并将被保留
var withEmptyString = qs.parse('a[]=&a[]=b')
assert.deepEqual(withEmptyString, { a: ['', 'b'] })

var withIndexedEmptyString = qs.parse('a[0]=b&a[1]=&a[2]=c')
assert.deepEqual(withIndexedEmptyString, { a: ['b', '', 'c'] })

// qs还将限制在数组中指定索引的最大索引为20. 任何索引大于的数组成员20都将被转换为以索引为键的对象。
var withMaxIndex = qs.parse('a[100]=b');//{ a: { '100': 'b' } }
assert.deepEqual(withMaxIndex, { a: { '100': 'b' } });
// 可以通过传递一个arrayLimit选项来覆盖此限制
var withArrayLimit = qs.parse('a[1]=b',{arrayLimit: 0});// { a: { '1': 'b' } }
assert.deepEqual(withArrayLimit,{a: {'1': 'b'}})

// 要完全禁用数组解析，请设置parseArrays为false
var noParsingArrays = qs.parse('a[]=b', { parseArrays: false });//{ a: { '0': 'b' } }
assert.deepEqual(noParsingArrays, { a: { '0': 'b' } });

// 如果混合使用符号，qs会将这两个项目合并为一个对象
var mixedNotation = qs.parse('a[0]=b&a[b]=c');//{ a: { '0': 'b', b: 'c' } }
assert.deepEqual(mixedNotation, { a: { '0': 'b', b: 'c' } });

// 解析对象数组
var arraysOfObjects = qs.parse('a[][b]=c');//{ a: [{ b: 'c' }] }
assert.deepEqual(arraysOfObjects, { a: [{ b: 'c' }] });

//用逗号加入数组，qs可以解析 (不能转换嵌套对象，例如a={b:1},{c:d})
var arraysOfCommaObjects = qs.parse('a=b,c', { comma: true })
assert.deepEqual(arraysOfCommaObjects, { a: ['b', 'c'] })

/**
 * 解析原始/标量值（数字、布尔值、空值等）
 */

// 默认情况下，所有值都被解析为字符串。
var primitiveValues = qs.parse('a=15&b=true&c=null');//{ a: '15', b: 'true', c: 'null' }
assert.deepEqual(primitiveValues, { a: '15', b: 'true', c: 'null' });

/**
 * stringify:qs.stringify(object, [options]);
 */
// 字符串化时，默认情况下，qs 默认 URI 对输出进行编码
qs.stringify({a: 'b'}) //a=b

qs.stringify({ a: { b: 'c' } }); // 'a%5Bb%5D=c'
// 通过将encode选项设置为false，可以禁用此编码
qs.stringify({a: {b: 'c'}},{encode: false}) // a[b]=c


//通过将encodeValuesOnly选项设置为true，可以禁用key的编码
var encodedValues = qs.stringify(
    { a: 'b', c: ['d', 'e=f'], f: [['g'], ['h']] },
    { encodeValuesOnly: true }
);// a=b&c[0]=d&c[1]=e%3Df&f[0][0]=g&f[1][0]=h（false->a=b&c%5B0%5D=d&c%5B1%5D=e%3Df&f%5B0%5D%5B0%5D=g&f%5B1%5D%5B0%5D=h）
assert.equal(encodedValues,'a=b&c[0]=d&c[1]=e%3Df&f[0][0]=g&f[1][0]=h');

// 自定义encoder的编码方法（注意：如果encode为false，则编码器选项不适用）
qs.stringify({ a: { b: 'c' } }, { encoder: function (str) {
    // Passed in values `a`, `b`, `c`
    return // Return encoded string
}})

qs.stringify({ a: { b: 'c' } }, { encoder: function (str, defaultEncoder, charset, type) {
    if (type === 'key') {
        return // Encoded key
    } else if (type === 'value') {
        return // Encoded value
    }
}})

var encoded = qs.stringify({ a: { b: 'c' } }, { encoder: function (str) {
    // Passed in values `a`, `b`, `c`
    return encodeURI(str)// 编码
}})// a%5Bb%5D=c



//类似于encoder有一个decoder选项,parse可以覆盖属性和值的解码
qs.parse('x=z', { decoder: function (str) {
    // Passed in values `x`, `z`
    return // Return decoded string
}})

qs.parse('x=z', { decoder: function (str, defaultDecoder, charset, type) {
    if (type === 'key') {
        return // Decoded key
    } else if (type === 'value') {
        return // Decoded value
    }
}})

var decoded = qs.parse('utf8=%26%2310003%3B', { decoder: function (str, defaultDecoder, charset, type) {
    console.log(charset) // iso-8859-1
    // Passed in values `x`, `z`
    return decodeURIComponent(str) // 解码
},charset: 'iso-8859-1',interpretNumericEntities: true}) // {utf8: '✓'}


// 数组被字符串化时，默认情况下它们被赋予显式索引
qs.stringify({ a: ['b', 'c', 'd'] })// 'a[0]=b&a[1]=c&a[2]=d'

qs.stringify({ a: ['b', 'c', 'd'] }, { indices: false });// 'a=b&a=c&a=d'

// arrayFormat选项来指定输出数组的格式 indices、brackets、repeat、comma
qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'indices',encode:false })// 'a[0]=b&a[1]=c'
qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'brackets',encode:false })// 'a[]=b&a[]=c'
qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'repeat',encode:false })// 'a=b&a=c'
qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'comma',encode:false })// 'a=b,c'

// 对象被字符串化时，默认情况下它们使用[]表示法
qs.stringify({ a: { b: { c: 'd', e: 'f' } } },{encode: false});// 'a[b][c]=d&a[b][e]=f'

//可以通过将allowDots选项设置为true来覆盖此选项以使用点表示法
qs.stringify({ a: { b: { c: 'd', e: 'f' } } }, { allowDots: true ,encode: false});// 'a.b.c=d&a.b.e=f'
assert.equal(qs.stringify({ a: { b: { c: 'd', e: 'f' } } }, { allowDots: true ,encode: false}),'a.b.c=d&a.b.e=f')

// 空字符串和空值将省略该值，但等号 (=) 保持不变
assert.equal(qs.stringify({ a: '' }), 'a=');


// 没有值的键（例如空对象或数组）将不返回任何内容

assert.equal(qs.stringify({ a: [] }), '');
assert.equal(qs.stringify({ a: {} }), '');
assert.equal(qs.stringify({ a: [{}] }), '');
assert.equal(qs.stringify({ a: { b: []} }), '');
assert.equal(qs.stringify({ a: { b: {}} }), '');

// 将完全忽略设置为undefined的属性
assert.equal(qs.stringify({ a: null, b: undefined }), 'a=');

// 查询字符串可以选择在前面加上问号
assert.equal(qs.stringify({ a: 'b', c: 'd' }, { addQueryPrefix: true }), '?a=b&c=d');

// 分隔符也可以用 stringify 覆盖
assert.equal(qs.stringify({ a: 'b', c: 'd' }, { delimiter: ';' }), 'a=b;c=d');

// 如果只想覆盖日期对象的序列化，可以提供serializeDate选项
var date = new Date(7);//7是毫秒数
assert.equal(qs.stringify({ a: date }), 'a=1970-01-01T00:00:00.007Z'.replace(/:/g, '%3A'));
assert.equal(
    qs.stringify({ a: date }, { serializeDate: function (d) { 
        return d.getTime(); 
    } }),
    'a=7'
);

// 使用sort选项来影响参数键的顺序
/**
 *  localeCompare字符串比较函数:string.localeCompare(targetString,locales,options)
 *  返回值大于0：说明当前字符串string大于对比字符串targetString
 * 
 *  返回值小于0：说明当前字符串string小于对比字符串targetString
 * 
 *  返回值等于0：说明当前字符串string等于对比字符串targetString
 */
assert.equal(qs.stringify({ a: 'c', z: 'y', b : 'f' }, { sort: (a,b)=> a.localeCompare(b) }), 'a=c&b=f&z=y');

// 最后，您可以使用过滤器选项来限制哪些键将包含在字符串化输出中。
// 如果您传递一个函数，将为每个键调用该函数以获得替换值。
// 否则，如果传递数组，它将用于选择属性和数组索引进行字符串化
function filterFunc(prefix, value) {
    if (prefix == 'b') {
        // Return an `undefined` value to omit a property.
        return;
    }
    if (prefix == 'e[f]') {
        return value.getTime();
    }
    if (prefix == 'e[g][0]') {
        return value * 2;
    }
    return value;
}
qs.stringify({ a: 'x',b: 'y', c: 'd', e: { f: new Date(123), g: [2] } }, { filter: filterFunc ,encode: false});//a=x&c=d&e[f]=123&e[g][0]=4

assert.equal(qs.stringify({ a: 'b', c: 'd', e: 'f' }, { filter: ['a', 'e'] }),'a=b&e=f')

assert.equal(qs.stringify({ a: ['b', 'c', 'd'], e: 'f' }, { filter: ['a', 0, 2] ,encode: false}),'a[0]=b&a[2]=d')

// 使用filter为用户定义的类型注入自定义序列化
class Range {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
}
qs.stringify(
    {
        range: new Range(30,70)
    },
    {
        filter: (prefix,value)=>{
            if(value instanceof Range){
                return `${value.from}...${value.to}`
            }
            // serialize the usual way
            return value
        }
    }
)//range=30...70

/**
 * 处理null值
 */
// 默认情况下，null值被视为空字符串
var withNull = qs.stringify({ a: null, b: '' });
assert.equal(withNull, 'a=&b=');

// 解析不区分带等号和不带等号的参数。两者都转换为空字符串
var equalsInsensitive = qs.parse('a&b=');
assert.deepEqual(equalsInsensitive, { a: '', b: '' });

// 要区分null值和空字符串，请使用strictNullHandling标志。在结果字符串中，null 值没有=符号
var strictNull = qs.stringify({ a: null, b: '' }, { strictNullHandling: true });
assert.equal(strictNull, 'a&b=');

// 在不使用=返回null的情况下解析值，请使用strictNullHandling标志
var parsedStrictNull = qs.parse('a&b=', { strictNullHandling: true });
assert.deepEqual(parsedStrictNull, { a: null, b: '' });

// 指定编码的字符集
var iso = qs.stringify({ æ: 'æ' }, { charset: 'iso-8859-1' });//%E6=%E6 
var utf8 = qs.stringify({ æ: 'æ' }, { charset: 'utf-8' });//%C3%A6=%C3%A6

// 如果复选标记utf8=✓选中，可以使用charsetSentinel选项来宣布字符使用正确编码的参数
var sentinel = qs.stringify({ a: '☺' }, { charsetSentinel: true });
assert.equal(sentinel, 'utf8=%E2%9C%93&a=%E2%98%BA');

var isoSentinel = qs.stringify({ a: 'æ' }, { charsetSentinel: true, charset: 'iso-8859-1' });
assert.equal(isoSentinel, 'utf8=%26%2310003%3B&a=%E6');


async function asycnFun(){
    const p1 = await new Promise((resolve,reject)=>{
        setTimeout(()=>resolve(fetch("https://api.apiopen.top/api/sentences").then(response=>{return response.text()})),2000)
    }).then(value=>{
        console.log(value)
        return value
    })
    const p2 =await new Promise((resolve,reject)=>{
        setTimeout(()=>resolve(fetch("https://api.apiopen.top/api/sentences").then(response=>{return response.text()})),3000)
    }).then(value=>{
        console.log(value)
        return value
    })
    const p3 =await new Promise((resolve,reject)=>{
        setTimeout(()=>resolve(fetch("https://api.apiopen.top/api/sentences").then(response=>{return response.text()})),5000)
    }).then(value=>{
        console.log(value)
        return value
    })
    let arr = []
    return arr.concat(p1,p2,p3)
}

let promise = new Promise(()=>{})

console.log(promise)

const result = asycnFun()

result.then(value=>console.log(value))