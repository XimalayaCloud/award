/**
 * 存在路由的多页切换应用
 */
import { emitter } from 'award-utils';
import main from './main';
import EventEmitter from './EventEmitter';

const emit = new EventEmitter();
emitter.storeEmitter(emit);

module.exports = main;
