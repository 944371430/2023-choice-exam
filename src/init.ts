/*
在 index 开头请导入该文件，因为这部分初始化需要优先执行，尤其是对于其它用户模块来说。
之所以不和 index 写一起，是因为 jet-brain 的 ide 格式化代码会改变语句执行顺序。
像是下面覆写 console.log 的代码，如果在其它用户模块导入之后才执行，在那些用户模块使用 console.log 时就会没有效果了。
 */

// 全局覆写 console.log，实现记录 Log 所在代码行和时间
const oldLog = console.log
console.log = (...data: any[]) => {
    oldLog(...data)
    const stack = Error().stack
    // 必须做类型检查，否则 ts 编译不通过
    if (typeof stack === 'string') oldLog(`[Log ${Date()}]`, stack.split('\n')[2])
}

// 定时输出内存占用
import {appendFileSync, writeFileSync} from 'fs'

const start = Date.now()
writeFileSync('memoryUsage.csv', 'Time Alive (sec), Memory Used (Byte)\n')
setInterval(() => {
    appendFileSync('memoryUsage.csv', `${Date.now() - start},${process.memoryUsage().heapUsed}\n`)
}, 1000)
