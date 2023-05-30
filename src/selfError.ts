/*
selfError 是程序自用的一类错误。在 index 中已编写错误处理中间件，当捕获此类错误时，认为是业务领域的错误；当捕获其他类型错误时，认为是程序自身错误，以此作区分，避免排查时被误导。
构造 objectId 使用 getObjectId 方法，对传参错误的情况已单独处理
 */
import {KeyValue} from './returnType'
import {ObjectId} from 'mongodb'
import {BSONError} from 'bson'

export class selfError extends Error {
    data: KeyValue

    constructor(msg: string, data: KeyValue = {}) {
        super(msg)
        this.data = data
    }
}

export const getObjectId = (inputId: string) => {
    try {
        return new ObjectId(inputId)
    } catch (err) {
        if (BSONError.isBSONError(err) && err.message === 'Argument passed in must be a string of 12 bytes or a string of 24 hex characters or an integer') throw new selfError(err.message)
        throw err
    }
}
