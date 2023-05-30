/*
定义了返回值的一种统一规范，不仅仅用于接口返回数据中，还用于各方法的返回值中。
 */
export interface KeyValue {
    [key: string]: unknown
}

export enum ReturnCode {
    OK = 200,
    FAIL = 400
}

export interface ReturnMsg {
    code: ReturnCode,
    msg: string,
    data: KeyValue
}

export const ok = (data: KeyValue = {}, msg: string = ''): ReturnMsg => ({code: ReturnCode.OK, msg, data})
export const fail = (msg: string, data: KeyValue = {}): ReturnMsg => ({code: ReturnCode.FAIL, msg, data})
