/*
主程序入口。
 */

import './init'
// express 初始化
import express, {Application, Response} from 'express'
import {fail} from './returnType'
import {router, send} from './router'
import {selfError} from './selfError'

const app: Application = express()
// 引入路由
app.use('/', router)
// 错误处理中间件
app.use((err: Error, _req: any, res: Response, _next: any) => {
    if (err instanceof selfError) send(res, fail(err.message, err.data))
    else {
        console.log(err)
        send(res, fail('Uncaught exception.', {message: err.message}))
    }
})
app.listen(8000, () => console.log('Server started.'))
// express app 启动结尾
